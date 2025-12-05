import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import products from "/public/products.json";
import Link from "next/link";

export default function BrowseProductsPage() {
  console.log("Products:", products);

  return (
    <div>
      <DashboardNavbar />

      <div className="p-10">
        <h1 className="text-2xl font-semibold mb-6">Browse Products</h1>

        {products.length === 0 ? (
          <p>No products found. Add some in data/products.json.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/dashboard/products/${product.id}`}>
                <div className="bg-white shadow rounded-lg p-5 cursor-pointer hover:shadow-lg transition">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md"
                  />

                  <h2 className="text-lg font-semibold mt-3">{product.name}</h2>
                  <p className="text-gray-700 mt-1">₦{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
