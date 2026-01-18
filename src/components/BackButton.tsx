export const BackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button className="bg-gray-600 hover:bg-gray-700 text-white border-none px-4 py-2 mb-4 rounded-md text-sm" onClick={onClick}>
      Back to List
    </button>
  );
};
