import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl transition"
    >
      ← Back
    </button>
  );
};

export default BackButton;
