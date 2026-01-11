import { useParams } from "react-router-dom";

export default function BinPage() {
  const { binId } = useParams();

  return (
    <div>
      <h2>Bin: {binId}</h2>
      <p>This is where bin contents will live.</p>
    </div>
  );
}
