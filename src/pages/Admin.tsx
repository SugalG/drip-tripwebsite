import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";


const categories = [
  {
    name: "Disposables",
    value: "disposables"
  },
  {
    name: "Pods/Mods",
    value: "mods"
  },
  {
    name: "E-liquids",
    value: "eliquids"
  },
  {
    name: "Accessories",
    value: "accessories"
  }
]

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
}

const Admin = () => {
  // const [products, setProducts] = useState<Product[]>([]);
  // const [loadingProducts, setLoadingProducts] = useState(true);

  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading: loadingProducts, isError:fetchingProductError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:4000/api/products");
        const data = await res.json();
        return data
        // setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        throw new Error("Failed to fetch Products")
      }
    }
  })

  if(loadingProducts){
    return <div>Loading.............</div>
  }

  if(fetchingProductError){
    return <div>Products couldn't be fetched</div>
  }

  // Add / edit product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      setMessage("Please wait for the image to finish uploading ❗");
      return;
    }

    if (!imageUrl) {
      setMessage("Please upload an image before creating the product ❗");
      return;
    }

    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:4000/api/products/${id}`
      : "http://localhost:4000/api/products";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          description,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setMessage(
        id
          ? "Product updated successfully ✅"
          : "Product created successfully ✅"
      );

      // Reset form
      setId(null);
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImageUrl("");

    } catch (error) {
      console.error(error);
      setMessage("Error saving product ❌");
    }
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete product");

      setMessage("Product deleted successfully ✅");
    } catch (err) {
      console.error(err);
      setMessage("Error deleting product ❌");
    }
  };

  // Upload image
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file); // key must match multer.single("image")

    try {
      setUploading(true);
      setMessage("Uploading image... ⏳");

      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setMessage("Image uploaded ✅");
      } else {
        setMessage("Image upload failed ❌");
      }
    } catch (err) {
      console.error("Upload failed", err);
      setMessage("Image upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description);
    setImageUrl(product.imageUrl);
    setMessage("");
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-start p-4 pt-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </Link>

      <div className="w-full max-w-lg p-8 rounded-3xl gradient-card shadow-card border border-border/50 mb-10">
        <h1 className="text-3xl font-display font-bold gradient-text mb-6 text-center">
          {id ? "Edit Product" : "Add Product"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border"
            required
          />

          <input
            type="number"
            placeholder="Price (NPR)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border"
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.value}>
                {cat.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border"
            rows={3}
            required
          />

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files[0])
              }
              className="w-full px-4 py-2 rounded-xl bg-background border border-border"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-1">
                Uploading...
              </p>
            )}
          </div>

          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border border-border"
              />
            </div>
          )}

          <motion.button
            type="submit"
            className="w-full py-4 rounded-xl gradient-button text-primary-foreground font-semibold shadow-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={uploading} // <--- disable during upload
          >
            {uploading
              ? "Uploading Image..."
              : id
                ? "Update Product"
                : "Create Product"}
          </motion.button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </div>

      {/* Product List */}
      <div className="w-full max-w-3xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingProducts ? (
          <p className="text-center col-span-full">Loading products...</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-40 object-cover rounded-xl mb-2"
              />
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{product.name}</h3>
                <div className="flex gap-2">
                  <motion.button
                    className="p-1 rounded-full bg-gray-900 text-background"
                    onClick={() => handleEdit(product)}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="p-1 rounded-full bg-red-500 text-background"
                    onClick={() => handleDelete(product.id)}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <p className="font-bold mt-1">
                NPR {product.price.toLocaleString("en-NP")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;
