import { motion } from "framer-motion";
import { X } from "lucide-react";

const categories = [
  { name: "Disposables", value: "Disposables" },
  { name: "Pods/Mods", value: "Mods" },
  { name: "E-liquids", value: "E-Liquids" },
  { name: "Accessories", value: "Accessories" },
];

type Props = {
  form: any; // keep simple, hook returns a big object
};

export default function ProductForm({ form }: Props) {
  const {
    id,
    name,
    price,
    category,
    description,
    uploading,
    message,
    MAX_IMAGES,
    activeImages,
    activeCover,
    coverIndex,
    selectedFiles,
    flavors,
    flavorInput,

    setName,
    setPrice,
    setCategory,
    setDescription,
    setCoverIndex,
    setFlavorInput,

    resetForm,
    handleFilePick,
    removeSelectedImage,
    removeUploadedImage,
    uploadImages,
    addFlavor,
    removeFlavor,
    save,
  } = form;

  // ✅ IMPORTANT:
  // Product can ONLY be saved when images are uploaded (imageUrls exist) and not uploading.
  const canSubmit = !uploading && Array.isArray(form.imageUrls) && form.imageUrls.length > 0;

  return (
    <div className="w-full max-w-lg p-8 rounded-3xl gradient-card shadow-card border border-border/50 mb-10">
      <h1 className="text-3xl font-display font-bold gradient-text mb-2 text-center">
        {id ? "Edit Product" : "Add Product"}
      </h1>

      {id && (
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Cancel Edit
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-4"
      >
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

        {/* ✅ Images */}
        <div className="space-y-3">
          <div className="text-sm font-semibold">Product Images (max {MAX_IMAGES})</div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilePick(e.target.files)}
            className="w-full px-4 py-2 rounded-xl bg-background border border-border"
            disabled={uploading}
          />

          {activeImages.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">
                Images (click one to set cover)
              </div>

              <div className="flex gap-3 flex-wrap">
                {activeImages.map((src: string, idx: number) => {
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

                      {isCover && (
                        <span className="absolute -top-2 -left-2 text-[10px] px-2 py-1 rounded-full bg-primary text-primary-foreground shadow">
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          // if urls exist -> removing uploaded
                          if (form.imageUrls.length > 0) removeUploadedImage(idx);
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

              <p className="text-xs text-muted-foreground mt-2">
                Tip: Click an image to mark it as cover. Remove any image anytime.
              </p>
            </div>
          )}

          {/* ✅ Upload button only when local selected exists */}
          {selectedFiles.length > 0 && (
            <motion.button
              type="button"
              onClick={uploadImages}
              className="w-full py-3 rounded-xl bg-card border border-border hover:border-primary transition font-semibold"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Selected Images"}
            </motion.button>
          )}

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
              {flavors.map((f: string) => (
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

        {/* ✅ Submit disabled until uploaded images exist */}
        <motion.button
          type="submit"
          className={`w-full py-4 rounded-xl font-semibold shadow-button transition ${
            canSubmit
              ? "gradient-button text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          whileHover={canSubmit ? { scale: 1.02 } : undefined}
          whileTap={canSubmit ? { scale: 0.98 } : undefined}
          disabled={!canSubmit}
        >
          {uploading
            ? "Uploading Images..."
            : !form.imageUrls?.length
            ? "Upload images to enable"
            : id
            ? "Update Product"
            : "Create Product"}
        </motion.button>
      </form>

      {message && <p className="text-center mt-4 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}