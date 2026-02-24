interface Props {
  name: string;
  onClick: () => void;
}

const DepartmentCard: React.FC<Props> = ({ name, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition"
    >
      <h3 className="text-lg font-semibold text-gray-700">
        {name}
      </h3>
    </div>
  );
};

export default DepartmentCard;
