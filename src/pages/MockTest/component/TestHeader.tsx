import React from "react";
import IcBreadcrumbGbk from "../../../assets/icons/IcBreadcrumbGbk";

interface TestHeaderProps {
  session: any;
  onGoBack: () => void;
  isView: boolean;
}

const TestHeader: React.FC<TestHeaderProps> = ({
  session,
  onGoBack,
  isView,
}) => {
  return (
    <div className="w-full flex items-center justify-between mb-5">
      {/* Return button */}
      <div
        className="inline-flex items-center gap-3 text-lg text-main font-normal cursor-pointer"
        onClick={onGoBack}
      >
        <IcBreadcrumbGbk />
        <span>{isView ? "Trở về" : "Thoát"}</span>
      </div>

      {/* Audio player */}
      {/* session?.sessionType === "full-test" &&  */}
      {session?.testId?.audio && (
        <div className="flex-1 flex justify-center">
          <audio
            controls
            className="w-full max-w-2xl rounded-full bg-gray-100"
            src={session?.testId?.audio}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default TestHeader;
