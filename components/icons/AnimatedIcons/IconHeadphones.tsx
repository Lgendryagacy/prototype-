import { motion } from "motion/react";

interface CircleHelpProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
}

const CircleHelp = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}: CircleHelpProps) => {
  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8B5CF6",
        backgroundColor: "#EDE9FE",
        borderRadius: "10px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <motion.g
          variants={{
            normal: { translateY: "0%" },
            animate: { 
              translateY: ["-2px", "2px", "-2px"],
              transition: {
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              }
            },
          }}
          initial="normal"
          animate="animate"
        >
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </motion.g>
      </svg>
    </div>
  );
};

export { CircleHelp };

