// src/components/Button/Button.jsx
import { motion } from "framer-motion";
import "./Button.css";

/**
 * @typedef {'primary'|'secondary'|'ghost'|'success'|'danger'} ButtonVariant
 * @typedef {'sm'|'md'|'lg'} ButtonSize
 * @typedef {'button'|'submit'|'reset'} ButtonType
 */

/**
 * @param {{
 *  children: any,
 *  variant?: ButtonVariant,
 *  size?: ButtonSize,
 *  loading?: boolean,
 *  disabled?: boolean,
 *  fullWidth?: boolean,
 *  leftIcon?: any,
 *  rightIcon?: any,
 *  onClick?: ((e: any) => void) | undefined,
 *  type?: ButtonType,
 *  className?: string,
 *  [x: string]: any
 * }} props
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick = undefined,
  type = "button",
  className = "",
  ...props
}) => {
  const isDisabled = disabled || loading;

  // extra safety in case somebody passes something weird
  /** @type {ButtonType} */
  const safeType = type === "submit" || type === "reset" ? type : "button";

  const buttonClasses = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && "btn-full-width",
    loading && "btn-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type={safeType}
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -2, scale: 1.01 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {leftIcon ? <span className="btn-icon btn-icon-left">{leftIcon}</span> : null}
          <span className="btn-text">{children}</span>
          {rightIcon ? <span className="btn-icon btn-icon-right">{rightIcon}</span> : null}
        </>
      )}
    </motion.button>
  );
};

export default Button;
