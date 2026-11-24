import { motion } from "motion/react";
import type { Variants } from "motion/react";

interface ShoppingBagProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const bagVariants: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const handleVariants: Variants = {
  normal: { rotateX: 0 },
  animate: {
    rotateX: [0, 10, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const ShoppingBagIcon = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  ...props
}: ShoppingBagProps) => {
  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#10B981",
        backgroundColor: "#D1FAE5",
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
        {/* Shopping bag body */}
        <motion.path
          d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
          variants={bagVariants}
          initial="normal"
          animate="animate"
        />
        
        {/* Shopping bag line */}
        <motion.path
          d="M3 6h18"
          variants={bagVariants}
          initial="normal"
          animate="animate"
        />
        
        {/* Shopping bag handles */}
        <motion.path
          d="M16 10a4 4 0 0 1-8 0"
          variants={handleVariants}
          initial="normal"
          animate="animate"
        />
      </svg>
    </div>
  );
};

export { ShoppingBagIcon };
