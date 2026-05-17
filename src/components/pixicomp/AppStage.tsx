// @ts-nocheck
import { AnimatedSprite, Container, Graphics, Sprite, Text, useTick } from "@pixi/react";
import { TextStyle, Texture, Graphics as GraphicsRaw, ColorMatrixFilter } from "pixi.js";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { renderCurve as _renderCurve, createGradTexture, curveFunction, maskDraw as _drawMask, smoothen, _drawOuterBoundery, _drawInnerBoundery, interpolate, webpORpng } from "../../utils";
import { dimensionType, gameAnimStatusType } from "../../@types";

const AppStage = ({ 
    payout, 
    game_anim_status, 
    dimension, 
    pixiDimension, 
    trigParachute 
}: { 
    payout: number, 
    game_anim_status: gameAnimStatusType, 
    dimension: dimensionType, 
    pixiDimension: dimensionType, 
    trigParachute: { uniqId: number, isMe: boolean } 
}) => {

    const tickRef = useRef(0);
    const [hueRotate, setHueRotate] = useState(0);
    const [planeScale, setPlaneScale] = useState(0.2);
    const [pulseBase, setPulseBase] = useState(0.8);
    const [planeFrames, setPlaneFrames] = useState<Texture[] | undefined>();
    const [parachuteMeFrames, setParachuteMeFrames] = useState<Texture[] | undefined>();
    const [parachuteElseFrames, setParachuteElseFrames] = useState<Texture[] | undefined>();
    const [parachutesMe, setParachutesMe] = useState<{ x: number, y: number }[]>([]);
    const [parachutesElse, setParachutesElse] = useState<{ x: number, y: number }[]>([]);
    const [planeX, setPlaneX] = useState(0);
    const [ontoCorner, setOntoCorner] = useState(0);
    const [pulseGraph, setPulseGraph] = useState(1);

    const renderCurve = useCallback((g: GraphicsRaw) => _renderCurve(g, dimension), [dimension]);
    const drawOuterBoundery = useCallback((g: GraphicsRaw) => _drawOuterBoundery(g, dimension), [dimension]);
    const drawInnerBoundery = useCallback((g: GraphicsRaw) => _drawInnerBoundery(g, dimension), [dimension]);
    const curveMask = useCallback((g: GraphicsRaw) => _drawMask(g, { width: dimension.width - 40, height: dimension.height - 40 }), [dimension]);
    const dotLeftBottom = useCallback((g: GraphicsRaw) => _drawMask(g, { width: 1, height: 1 }), []);

    const addParachute = (isMe: boolean) => {
        const pos = {
            x: (pulseBase + pulseGraph) * planeX,
            y: dimension.height - 40 - (1 - pulseGraph) * curveFunction(planeX, { width: dimension.width - 40, height: dimension.height - 40 })
        };
        if (isMe) setParachutesMe(v => [...v, pos]);
        else setParachutesElse(v => [...v, pos]);
    };

    useEffect(() => {
        if (trigParachute.uniqId > 0) addParachute(trigParachute.isMe);
    }, [trigParachute.uniqId]);

    const gradTexture = useMemo(() => createGradTexture(dimension), [dimension]);

    const handleResize = () => {
        setPlaneScale(interpolate(window.innerWidth, 400, 1920, 0.5, 0.2));
        setPulseBase(interpolate(window.innerWidth, 400, 1920, 0.6, 0.8));
    };

    useEffect(() => {
        // Plane frames
        const _plane: Texture[] = [];
        for (let i = 1; i <= 15; i++) _plane.push(Texture.from(`plane-anim-${i}.${webpORpng}`));
        setPlaneFrames(_plane);

        // Parachute frames
        const _parachuteMe: Texture[] = [];
        for (let i = 1; i <= 61; i++) _parachuteMe.push(Texture.from(`parachute-red-anim-${i}.${webpORpng}`));
        setParachuteMeFrames(_parachuteMe);

        const _parachuteElse: Texture[] = [];
        for (let i = 1; i <= 61; i++) _parachuteElse.push(Texture.from(`parachute-gray-anim-${i}.${webpORpng}`));
        setParachuteElseFrames(_parachuteElse);

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useTick((delta) => {
        setHueRotate(prev => prev + delta / 500);
    });

    const maskRef = useRef<GraphicsRaw>(null);
    const dotRef = useRef<GraphicsRaw>(null);
    const gameBoardMask = useRef<GraphicsRaw>(null);

    useTick((delta) => {
        if (game_anim_status !== "ANIM_STARTED") return;
        tickRef.current += delta * 0.01;
        const pulse = Math.sin(tickRef.current) * 0.06;
        setPulseGraph(pulse);
    });

    useEffect(() => {
        setPlaneX(smoothen(Math.min(tickRef.current * 300, dimension.width - 40), { width: dimension.width - 40, height: dimension.height - 40 }));
    }, [tickRef.current, dimension]);

    useEffect(() => {
        if (game_anim_status === "WAITING") tickRef.current = 0;
        if (game_anim_status === "ANIM_CRASHED") setOntoCorner(0);
    }, [game_anim_status]);

    const posPlane = useMemo(() => {
        const _ontoCorner = game_anim_status === "ANIM_CRASHED" ? ontoCorner : 0;
        return {
            x: (pulseBase + pulseGraph) * planeX + _ontoCorner * 150 + 40,
            y: dimension.height - 40 - (1 - pulseGraph) * curveFunction(planeX, { width: dimension.width - 40, height: dimension.height - 40 }) - _ontoCorner * 50
        };
    }, [pulseGraph, planeX, dimension, game_anim_status, ontoCorner, pulseBase]);

    const colorMatrix = useMemo(() => {
        const c = new ColorMatrixFilter();
        c.hue(hueRotate * 100, true);
        return c;
    }, [hueRotate]);

    return (
        <Container>
            <Sprite filters={[colorMatrix]} texture={gradTexture} width={dimension.width - 40} height={dimension.height - 40} position={{ x: 40, y: 0 }} />

            <Container visible={game_anim_status !== "WAITING"}>
                {planeFrames && (
                    <Container>
                        <AnimatedSprite
                            mask={gameBoardMask.current}
                            rotation={-Math.PI / 10}
                            pivot={{ x: 0.08, y: 0.54 }}
                            textures={planeFrames}
                            anchor={{ x: 0.07, y: 0.55 }}
                            scale={planeScale}
                            animationSpeed={0.5}
                            isPlaying={true}
                            initialFrame={0}
                            position={posPlane}
                        />
                        {parachutesMe.map((item, i) => (
                            <AnimatedSprite key={i} mask={gameBoardMask.current} pivot={{ x: 0.08, y: 0.54 }} textures={parachuteMeFrames || []} anchor={{ x: 0.4, y: 0.45 }} scale={2} animationSpeed={0.3} isPlaying={true} initialFrame={0} position={item} loop={false} />
                        ))}
                        {parachutesElse.map((item, i) => (
                            <AnimatedSprite key={i} mask={gameBoardMask.current} pivot={{ x: 0.08, y: 0.54 }} textures={parachuteElseFrames || []} anchor={{ x: 0.4, y: 0.45 }} scale={2} animationSpeed={0.3} isPlaying={true} initialFrame={0} position={item} loop={false} />
                        ))}
                    </Container>
                )}

                <Text 
                    visible={game_anim_status === "ANIM_STARTED"} 
                    text={payout.toFixed(2) + "x"}
                    anchor={0.5}
                    x={dimension.width / 2}
                    y={dimension.height / 2}
                    style={new TextStyle({
                        align: 'center',
                        fontFamily: 'Roboto',
                        fontSize: 100,
                        fontWeight: '700',
                        fill: ['#ffffff', '#00ff99'],
                        stroke: '#111111',
                        strokeThickness: 2,
                    })}
                />
            </Container>

            <Graphics draw={drawInnerBoundery} />
            <Graphics draw={drawOuterBoundery} />

            <Container ref={dotRef}>
                <Graphics draw={dotLeftBottom} scale={{ x: 40, y: dimension.height - 40 }} />
                <Graphics position={{ x: 40, y: dimension.height - 40 }} scale={{ x: dimension.width - 40, y: 40 }} draw={dotLeftBottom} />
            </Container>
        </Container>
    );
};

export default AppStage;