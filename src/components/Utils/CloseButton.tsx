type Props = {
  onClick?: () => void;
  darkmode?: boolean;
};

const CloseButton = (props: Props) => {
  const textColor = props.darkmode ? 'text-gray-200' : 'text-gray-400';
  const textHoverColor = props.darkmode ? 'text-gray-300' : 'text-gray-500';

  return (
    <button
      type="button"
      className={`rounded-md inline-flex items-center justify-center ${textColor} hover:${textHoverColor}`}
      onClick={props.onClick}
    >
      <svg
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default CloseButton;
