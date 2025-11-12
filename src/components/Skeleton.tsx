import * as React from "react";

type SkeletonBaseProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  "aria-label"?: string;
};

export const Skeleton: React.FC<SkeletonBaseProps> = ({
  className = "",
  "aria-label": ariaLabel = "Loading content",
  ...rest
}) => {
  const classes =
    "animate-pulse rounded-md bg-gray-200 dark:bg-gray-300 " + className;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      className={classes}
      {...rest}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

type SkeletonTextProps = {
  rows?: number;
  gapClassName?: string;
  lineClassName?: string;
  className?: string;
  "aria-label"?: string;
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  rows = 3,
  gapClassName = "space-y-3",
  lineClassName = "h-4",
  className = "",
  "aria-label": ariaLabel = "Loading text",
}) => {
  const safeRows = Math.max(1, rows);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      className={gapClassName + (className ? " " + className : "")}>
      {Array.from({ length: safeRows }).map((_, index) => {
        // Make last line shorter for a more realistic look
        const isLast = index === safeRows - 1;
        const widthClass = isLast ? "w-2/3" : "w-full";
        return (
          <Skeleton
            key={index}
            className={`${lineClassName} ${widthClass}`}
            aria-label="Loading line"
          />
        );
      })}
    </div>
  );
};

type SkeletonCircleProps = {
  size?: number; // pixels
  className?: string;
  "aria-label"?: string;
};

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 40,
  className = "",
  "aria-label": ariaLabel = "Loading avatar",
}) => {
  const style: React.CSSProperties = { width: size, height: size };
  return (
    <Skeleton
      style={style}
      className={"rounded-full " + className}
      aria-label={ariaLabel}
    />
  );
};

type SkeletonCardProps = {
  showAvatar?: boolean;
  titleRows?: number;
  bodyRows?: number;
  className?: string;
  "aria-label"?: string;
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  titleRows = 1,
  bodyRows = 3,
  className = "",
  "aria-label": ariaLabel = "Loading card",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
      className={
        "rounded-lg border border-gray-200 dark:border-gray-800 p-4 " +
        className
      }>
      <div className="flex items-start gap-3">
        {showAvatar ? <SkeletonCircle /> : null}
        <div className="flex-1">
          <SkeletonText
            rows={titleRows}
            lineClassName="h-5"
            gapClassName="space-y-2"
          />
          <div className="mt-4">
            <SkeletonText rows={bodyRows} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
