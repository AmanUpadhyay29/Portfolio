import type { ComponentType } from "react";
import MatrixDiagram from "./MatrixDiagram";
import TradingPlatformDiagram from "./TradingPlatformDiagram";
import XcHartDiagram from "./XcHartDiagram";

/** Diagram components by name, for <Diagram name="..." /> in the case studies. */
export const diagrams: Record<string, ComponentType> = {
  "trading-platform": TradingPlatformDiagram,
  matrix: MatrixDiagram,
  xchart: XcHartDiagram,
};
