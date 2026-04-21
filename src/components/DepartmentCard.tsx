interface Props {
  name: string;
  onClick: () => void;
}

const DepartmentCard: React.FC<Props> = ({ name, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group min-h-20 rounded-xl border border-[#dce8df] bg-white px-4 py-4 text-left shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-[#edf8f1]"
    >
      <h3 className="text-base font-medium text-slate-700 group-hover:text-emerald-800">
        {name}
      </h3>
    </div>
  );
};

export default DepartmentCard;
