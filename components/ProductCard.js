import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/dashboard/products/${product.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white">
        <div className="w-full h-52 relative mb-3">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-md"
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        <p className="text-gray-900 font-medium text-base">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
