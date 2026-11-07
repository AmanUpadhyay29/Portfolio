import { Box3, Cylinder, DiagramFrame, Face, Flow, FlowLabel, Label, Node, leftFace, pt } from "./parts";

const ID = "dg-xchart";

function Feed() {
  const [ax, ay] = pt(20, 15, 64);
  return (
    <Node cx={95} baseY={112} w={40} d={30}>
      <Box3 w={40} d={30} h={26} />
      <Face pts={leftFace(30, 6, 34, 9, 17)} fill="var(--dg-screen)" />
      {[10, 17, 24].map((x, i) => (
        <Face key={x} pts={leftFace(30.1, x, x + 4, 11, 15)} fill={i === 1 ? "var(--primary)" : "var(--status)"} />
      ))}
      <Box3 x={19} y={14} z={26} w={2} d={2} h={34} top="var(--muted)" left="var(--muted)" right="var(--muted)" />
      <circle cx={ax} cy={ay} r={4} style={{ fill: "var(--screen-pink)" }} />
      <path d={`M${ax - 11},${ay - 8} a14,14 0 0 0 0,16 M${ax + 11},${ay - 8} a14,14 0 0 1 0,16`} style={{ fill: "none", stroke: "var(--screen-pink)", strokeWidth: 2 }} />
    </Node>
  );
}

function Engine() {
  const pulse = [0, 0, 6, -8, 12, 0, 0]
    .map((dz, i) => pt(6 + i * 5, 34.3, 16 + dz).join(","))
    .join(" ");
  return (
    <Node cx={270} baseY={292} w={46} d={34}>
      <Box3 w={46} d={34} h={34} />
      <Face pts={leftFace(34, 4, 42, 6, 28)} fill="var(--dg-screen)" />
      <polyline points={pulse} style={{ fill: "none", stroke: "var(--screen-pink)", strokeWidth: 2 }} />
    </Node>
  );
}

function Chart() {
  const candles = [
    [8, 20, 30, true],
    [15, 24, 36, true],
    [22, 22, 32, false],
    [29, 28, 40, true],
    [36, 26, 34, false],
    [43, 30, 44, true],
  ] as const;
  return (
    <Node cx={95} baseY={292} w={56} d={8}>
      <Box3 x={22} y={1} w={10} d={6} h={14} />
      <Box3 z={14} w={56} d={8} h={40} />
      <Face pts={leftFace(8, 3, 53, 17, 51)} fill="var(--dg-screen)" />
      {candles.map(([x, z0, z1, up]) => (
        <Face key={x} pts={leftFace(8.1, x, x + 4, z0, z1)} fill={up ? "var(--status)" : "var(--screen-pink)"} />
      ))}
    </Node>
  );
}

/** XcHart: price feed, candle store, setup engine and the chart, in that order. */
export default function XcHartDiagram() {
  return (
    <DiagramFrame
      id={ID}
      width={360}
      height={360}
      maxWidth={480}
      title="How XcHart fits together"
      desc="A price feed streams ticks. In the private app the feed is Termless, an MT5 gateway built by thedev09; the screenshots on this page use a simulated feed. The candle store turns ticks into candles and saves them to disk. The setup engine reads closed bars only, and the chart receives candles and plans over a WebSocket."
      caption="Components only. The live feed is private; this site shows simulated data."
    >
      <Feed />
      <Label x={95} y={142} title="Price feed" sub={["Termless, by thedev09", "simulated for this site"]} />

      <Flow id={ID} from={[146, 84]} to={[226, 84]} />
      <FlowLabel x={186} y={74} text="ticks" />

      <Cylinder cx={270} baseY={112} r={28} h={50} bands={[16, 32]} />
      <Label x={270} y={142} title="Candle store" sub={["ticks into candles"]} />

      <Flow id={ID} from={[270, 176]} to={[270, 214]} />
      <FlowLabel x={262} y={200} anchor="end" text="closed bars" />

      <Engine />
      <Label x={270} y={320} title="Setup engine" sub={["closed bars only"]} />

      <Flow id={ID} from={[226, 262]} to={[148, 262]} />
      <FlowLabel x={187} y={252} text="candles" />
      <FlowLabel x={187} y={282} text="+ plans" />

      <Chart />
      <Label x={95} y={320} title="Chart" sub={["pushed over WebSocket"]} />
    </DiagramFrame>
  );
}
