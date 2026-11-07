import { Box3, Cylinder, DiagramFrame, Face, Flow, FlowLabel, Label, Node, leftFace, pt, rightFace } from "./parts";

const ID = "dg-trading";
const LED_ROWS = [10, 22, 34, 46, 58];

function Rack() {
  return (
    <Node cx={150} baseY={118} w={34} d={34}>
      <Box3 w={34} d={34} h={74} />
      {LED_ROWS.map((z, i) => (
        <g key={z}>
          <Face pts={rightFace(34, 5, 29, z, z + 8)} fill="var(--dg-screen)" />
          {[10, 17, 24].map((y, j) => {
            const [cx, cy] = pt(34.4, y, z + 4);
            return <circle key={y} cx={cx} cy={cy} r={1.9} style={{ fill: j === 2 && i % 2 === 0 ? "var(--primary)" : "var(--status)" }} />;
          })}
        </g>
      ))}
    </Node>
  );
}

function Monitor() {
  return (
    <Node cx={80} baseY={420} w={56} d={8}>
      <Box3 x={22} y={1} w={10} d={6} h={14} />
      <Box3 z={14} w={56} d={8} h={40} />
      <Face pts={leftFace(8, 3, 53, 17, 51)} fill="var(--dg-screen)" />
      {[0, 1, 2, 3].map((i) => (
        <Face key={i} pts={leftFace(8.1, 7, 7 + 18 + ((i * 13) % 26), 43 - i * 7, 46 - i * 7)} fill={i % 2 ? "var(--screen-blue)" : "var(--status)"} />
      ))}
    </Node>
  );
}

function Gateway() {
  return (
    <Node cx={270} baseY={230} w={46} d={34}>
      <Box3 w={46} d={34} h={28} />
      {[6, 15, 24, 33].map((x) => (
        <Face key={x} pts={leftFace(34, x, x + 6, 9, 19)} fill="var(--screen-blue)" />
      ))}
    </Node>
  );
}

function Broker() {
  return (
    <Node cx={270} baseY={420} w={44} d={34}>
      <Box3 w={44} d={34} h={34} />
      <Face pts={rightFace(44, 4, 30, 24, 28)} fill="var(--status)" />
      <Face pts={leftFace(34, 15, 29, 0, 22)} fill="var(--dg-screen)" />
      <Face pts={leftFace(34.1, 25, 27, 9, 13)} fill="var(--primary)" />
    </Node>
  );
}

/** v1: the bot fleet, its journals in Postgres, the dashboards, and the order path to the demo broker. */
export default function TradingPlatformDiagram() {
  return (
    <DiagramFrame
      id={ID}
      width={360}
      height={474}
      maxWidth={480}
      title="How the trading platform fits together"
      desc="40+ Python processes run under PM2. Their journals are synced into Postgres, and the NestJS dashboards read Postgres. The bots send orders through Termless, an MT5 gateway built by thedev09, to a demo broker account."
      caption="Components only. No prices, balances or accounts."
    >
      <Rack />
      <Label x={196} y={52} anchor="start" title="PM2 fleet" sub={["40+ processes"]} />

      <Flow id={ID} from={[132, 124]} to={[98, 152]} />
      <FlowLabel x={106} y={128} anchor="end" text="journals" />
      <Flow id={ID} from={[168, 124]} to={[238, 160]} />
      <FlowLabel x={214} y={128} anchor="start" text="orders" />

      <Cylinder cx={80} baseY={232} r={28} h={50} bands={[16, 32]} />
      <Label x={80} y={264} title="Postgres" sub={["journals, synced"]} />
      <Gateway />
      <Label x={270} y={264} title="Termless" sub={["by thedev09"]} />

      <Flow id={ID} from={[80, 296]} to={[80, 330]} />
      <Flow id={ID} from={[270, 296]} to={[270, 336]} />

      <Monitor />
      <Label x={80} y={446} title="Dashboards" sub={["NestJS + React"]} />
      <Broker />
      <Label x={270} y={446} title="Demo broker" sub={["demo accounts only"]} />
    </DiagramFrame>
  );
}
