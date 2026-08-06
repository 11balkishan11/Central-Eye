import React from 'react';
import { Frame } from '../../central-eye-runtime/scene/TransitionEngine';

interface SVGViewportProps {
  frame: Frame;
  width?: number;
  height?: number;
}

/**
 * SVG Viewport
 * 
 * A pure, dumb React component. It does NOT animate, it does NOT compute physics,
 * and it does NOT handle dragging. It simply accepts a computed Frame from the 
 * OS and paints it to the screen. 
 */
export function SVGViewport({ frame, width = 800, height = 600 }: SVGViewportProps) {
  const { sceneState } = frame;
  const { background, layers } = sceneState;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ background: background.primaryColor }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Background Layer (e.g. Grids) */}
      {background.type === 'grid' && (
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        </pattern>
      )}
      {background.type === 'grid' && <rect width="100%" height="100%" fill="url(#grid)" />}

      {/* 2. Topology Layers (Edges then Nodes) */}
      {layers.map(layer => (
        <g key={layer.id} style={{ display: layer.visible ? 'inline' : 'none' }}>
          
          {/* Edges */}
          {layer.edges.map(edge => {
            // Placeholder path - in reality, position is passed in
            return (
              <line 
                key={edge.id}
                x1={100} y1={100} x2={200} y2={200}
                stroke={edge.gradient[0]}
                strokeWidth={edge.width}
                strokeOpacity={edge.opacity}
              />
            );
          })}

          {/* Nodes */}
          {layer.nodes.map(node => (
            <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
              {/* Outer Glow */}
              {node.glow && (
                <circle r={node.radius + 8} fill={node.color} opacity={0.2} />
              )}
              {/* Core Node */}
              <circle r={node.radius} fill={node.color} opacity={node.opacity} />
              {/* Label */}
              <text 
                y={node.radius + 15} 
                textAnchor="middle" 
                fill="#A1A1AA" 
                fontSize="12px"
                fontFamily="var(--font-jetbrains-mono), monospace"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
