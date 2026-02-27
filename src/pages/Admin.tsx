import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const categories = [
  { name: "Disposables", value: "Disposables" },
  { name: "Pods/Mods", value: "Mods" },
  { name: "E-liquids", value: "E-Liquids" },
  { name: "Accessories", value: "Accessories" },
];

interface FlavorObj {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string[]; // ✅ array
  coverIndex: number; // ✅ cover
  flavors: FlavorObj[];
}

const MAX_IMAGES = 3;

const Admin = () => {
  const qc = useQueryClient();

  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // ✅ Selected local files (not uploaded yet)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // ✅ Uploaded URLs (Cloudinary)
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // ✅ cover selection (index based on current imageUrls / previewUrls)
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // ✅ flavors
  const [flavorInput, setFlavorInput] = useState("");
  const [flavors, setFlavors] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/api/products");
      if (!res.ok) throw new Error("Failed to fetch Products");
      return res.json();
    },
  });

  // ✅ which images to show in UI:
  // if edit has uploaded urls -> show those
  // else show selected local previews
  const activeImages = useMemo(() => {
    if (imageUrls.length > 0) return imageUrls;
    return previewUrls;
  }, [imageUrls, previewUrls]);

  const activeCover = useMemo(() => {
    return activeImages?.[coverIndex] || activeImages?.[0] || "";
  }, [activeImages, coverIndex]);

  const clampCoverIndex = (nextImagesLength: number, desiredCover: number) => {
    if (nextImagesLength <= 0) return 0;
    if (desiredCover < 0) return 0;
    if (desiredCover > nextImagesLength - 1) return 0;
    return desiredCover;
  };

  // ✅ add local images (1..3 total)
  const handleFilePick = (files: FileList | null) => {
    if (!files) return;

    const picked = Array.from(files);

    // merge with existing selected (so user can pick multiple times)
    const merged = [...selectedFiles, ...picked].slice(0, MAX_IMAGES);

    // cleanup old previews
    previewUrls.forEach((u) => URL.revokeObjectURL(u));

    const previews = merged.map((f) => URL.createObjectURL(f));

    setSelectedFiles(merged);
    setPreviewUrls(previews);

    // if you select new files, you are preparing a new upload set
    // (so clear uploaded urls, so you don't mix old + new)
    setImageUrls([]);
    setCoverIndex((prev) => clampCoverIndex(previews.length, prev));
    setMessage("");
  };

  // ✅ remove a LOCAL selected image (before upload)
  const removeSelectedImage = (idx: number) => {
    const nextFiles = selectedFiles.filter((_, i) => i !== idx);

    // cleanup old previews
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    const nextPreviews = nextFiles.map((f) => URL.createObjectURL(f));

    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);

    // cover fix
    setCoverIndex((prevCover) => {
      if (idx === prevCover) return 0;          // removed cover -> reset
      if (idx < prevCover) return prevCover - 1; // shift left
      return clampCoverIndex(nextPreviews.length, prevCover);
    });
  };

  // ✅ remove an UPLOADED image URL (edit mode or after upload)
  const removeUploadedImage = (idx: number) => {
    const nextUrls = imageUrls.filter((_, i) => i !== idx);
    setImageUrls(nextUrls);

    setCoverIndex((prevCover) => {
      if (idx === prevCover) return 0;
      if (idx < prevCover) return prevCover - 1;
      return clampCoverIndex(nextUrls.length, prevCover);
    });
  };

  // ✅ Upload selected images (1..3) to Cloudinary
  const handleUploadImages = async () => {
    if (!selectedFiles.length) {
      setMessage("Please select 1 to 3 images first ❗");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading images... ⏳");

      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file)); // ✅ must be "images"

      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Image upload failed ❌");
        return;
      }

      if (Array.isArray(data.imageUrls) && data.imageUrls.length) {
        // ✅ set uploaded urls, clear local selected previews
        setImageUrls(data.imageUrls.slice(0, MAX_IMAGES));

        // cleanup previews
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setSelectedFiles([]);
        setPreviewUrls([]);

        setCoverIndex((prev) => clampCoverIndex(data.imageUrls.length, prev));
        setMessage("Images uploaded ✅");
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

  // ✅ flavors helpers
  const addFlavor = () => {
    const f = flavorInput.trim();
    if (!f) return;

    const exists = flavors.some((x) => x.toLowerCase() === f.toLowerCase());
    if (exists) {
      setFlavorInput("");
      return;
    }

    setFlavors((prev) => [...prev, f]);
    setFlavorInput("");
  };

  const removeFlavor = (f: string) => {
    setFlavors((prev) => prev.filter((x) => x !== f));
  };

  // ✅ create/update product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      setMessage("Please wait for image upload to finish ❗");
      return;
    }

    // Must have uploaded URLs to save
    if (!imageUrls.length) {
      setMessage("Please upload images before saving product ❗");
      return;
    }

    const safeCover = clampCoverIndex(imageUrls.length, coverIndex);

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
          imageUrl: imageUrls,   // ✅ array
          coverIndex: safeCover, // ✅ cover
          flavors,               // ✅ string[]
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Error saving product ❌");
        return;
      }

      setMessage(id ? "Product updated successfully ✅" : "Product created successfully ✅");
      qc.invalidateQueries({ queryKey: ["products"] });

      // reset form
      setId(null);
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");

      // cleanup previews
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setSelectedFiles([]);
      setPreviewUrls([]);

      setImageUrls([]);
      setCoverIndex(0);

      setFlavors([]);
      setFlavorInput("");
    } catch (error) {
      console.error(error);
      setMessage("Error saving product ❌");
    }
  };

  // ✅ delete product
  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      setMessage("Product deleted successfully ✅");
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error(err);
      setMessage("Error deleting product ❌");
    }
  };

  // ✅ edit product: load uploaded urls + cover + flavors
  const handleEdit = (product: Product) => {
    setId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description);

    // edit: show existing uploaded urls
    setImageUrls((product.imageUrl || []).slice(0, MAX_IMAGES));
    setCoverIndex(
      Number.isFinite(product.coverIndex)
        ? clampCoverIndex((product.imageUrl || []).length, product.coverIndex)
        : 0
    );

    // clear local selection + previews
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);

    setFlavors((product.flavors || []).map((f) => f.name));
    setFlavorInput("");
    setMessage("");
  };

  // ✅ reset/cancel edit
  const handleCancelEdit = () => {
    setId(null);
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");

    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);

    setImageUrls([]);
    setCoverIndex(0);

    setFlavors([]);
    setFlavorInput("");
    setMessage("");
  };

  if (isLoading) return <div>Loading.............</div>;
  if (isError || !products) return <div>Products couldn't be fetched</div>;

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
        <h1 className="text-3xl font-display font-bold gradient-text mb-2 text-center">
          {id ? "Edit Product" : "Add Product"}
        </h1>

        {id && (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Cancel Edit
            </button>
          </div>
        )}

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
              <option key={cat.value} value={cat.value}>
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

          {/* ✅ Images section */}
          <div className="space-y-3">
            <div className="text-sm font-semibold">Product Images (max {MAX_IMAGES})</div>

            {/* pick new local files */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilePick(e.target.files)}
              className="w-full px-4 py-2 rounded-xl bg-background border border-border"
              disabled={uploading}
            />

            {/* ✅ show ALL images (uploaded or local) */}
            {activeImages.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2">Images (click one to set cover)</div>

                <div className="flex gap-3 flex-wrap">
                  {activeImages.map((src, idx) => {
                    const isCover = idx === coverIndex;

                    return (
                      <div
                        key={`${src}-${idx}`}
                        className={`relative rounded-xl border p-1 transition ${
                          isCover ? "border-primary" : "border-border"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCoverIndex(idx)}
                          className="block"
                          title="Click to set as cover"
                        >
                          <img
                            src={src}
                            alt={`img-${idx}`}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </button>

                        {/* cover badge */}
                        {isCover && (
                          <span className="absolute -top-2 -left-2 text-[10px] px-2 py-1 rounded-full bg-primary text-primary-foreground shadow">
                            Cover
                          </span>
                        )}

                        {/* remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            // if these are uploaded urls -> remove from imageUrls
                            if (imageUrls.length > 0) removeUploadedImage(idx);
                            else removeSelectedImage(idx);
                          }}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* small note */}
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Click an image to mark it as cover. Remove any image anytime.
                </p>
              </div>
            )}

            {/* upload button only shows when local selected exists */}
            {selectedFiles.length > 0 && (
              <motion.button
                type="button"
                onClick={handleUploadImages}
                className="w-full py-3 rounded-xl bg-card border border-border hover:border-primary transition font-semibold"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Selected Images"}
              </motion.button>
            )}

            {/* Show cover preview ALWAYS (from activeImages) */}
            {activeCover && (
              <div className="mt-2">
                <div className="text-sm font-semibold mb-2">Cover Preview</div>
                <img
                  src={activeCover}
                  alt="Cover preview"
                  className="w-32 h-32 object-cover rounded-xl border border-border"
                />
              </div>
            )}
          </div>

          {/* ✅ Flavors */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">Flavors</div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Mint"
                value={flavorInput}
                onChange={(e) => setFlavorInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFlavor();
                  }
                }}
              />
              <button
                type="button"
                onClick={addFlavor}
                className="px-4 rounded-xl border border-border hover:border-primary transition"
              >
                Add
              </button>
            </div>

            {flavors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {flavors.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20"
                  >
                    {f}
                    <button type="button" onClick={() => removeFlavor(f)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            className="w-full py-4 rounded-xl gradient-button text-primary-foreground font-semibold shadow-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={uploading}
          >
            {id ? "Update Product" : "Create Product"}
          </motion.button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-muted-foreground">{message}</p>
        )}
      </div>

      {/* Product List */}
      <div className="w-full max-w-3xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const cover = product.imageUrl?.[product.coverIndex] || product.imageUrl?.[0] || "";

          return (
            <div
              key={product.id}
              className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between"
            >
              <img
                src={cover}
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

              {/* flavors preview */}
              {product.flavors?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.flavors.slice(0, 3).map((f) => (
                    <span
                      key={f.id}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {f.name}
                    </span>
                  ))}
                  {product.flavors.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      +{product.flavors.length - 3}
                    </span>
                  )}
                </div>
              )}

              <p className="font-bold mt-2">
                NPR {product.price.toLocaleString("en-NP")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;