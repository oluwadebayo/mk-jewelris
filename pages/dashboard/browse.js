import fs from "fs";
import path from "path";

export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), "data", "products.json");
  const fileData = fs.readFileSync(filePath, "utf-8");
  const products = JSON.parse(fileData);

  return {
    props: {
      products,
    },
  };
}

export default function BrowseProducts({ products }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Browse Products</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <h3>{p.name}</h3>
            <p>₦{p.price.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
