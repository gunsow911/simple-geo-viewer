type Props = {
  onClick?: () => void;
};

const CloseButton = (props: Props) => {
  return (
    <button
      type="button"
      className="bg-white rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-500"
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
