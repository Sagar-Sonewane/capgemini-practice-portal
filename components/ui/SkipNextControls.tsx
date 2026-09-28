import React from "react";
import Button from "./Button";

export interface SkipNextControlsProps {
  onSkip?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
}

export const SkipNextControls: React.FC<SkipNextControlsProps> = ({
  onSkip,
  onNext,
  isNextDisabled = false,
  nextLabel = "Next",
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      {onSkip ? (
        <Button variant="outline" onClick={onSkip}>
          Skip
        </Button>
      ) : <div />}
      {onNext ? (
        <Button variant="primary" onClick={onNext} disabled={isNextDisabled}>
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default SkipNextControls;
