import { motion } from "framer-motion";
import { X } from "lucide-react";

const categories = [
  { name: "Disposables", value: "Disposables" },
  { name: "Devices", value: "Devices" },
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
    ohms,
    ohmInput,
    flavors,
    flavorInput,
    colors,
    colorInput,

    setName,
    setPrice,
    setCategory,
    setDescription,
    setCoverIndex,
    setFlavorInput,
    setOhmInput,
    setColorInput,

    resetForm,
    handleFilePick,
    removeSelectedImage,
    removeUploadedImage,
    uploadImages,
    addOhm,
    removeOhm,
    addFlavor,
    removeFlavor,
    addColor,
    removeColor,
    save,
  } = form;

  // ✅ IMPORTANT:
  // Product can ONLY be saved when images are uploaded (imageUrls exist) and not uploading.
  const canSubmit = !uploading && Array.isArray(form.imageUrls) && form.imageUrls.length > 0;

  return (
    <div className="w-full rounded-[1.25rem] bg-white/78 backdrop-blur-xl p-5 shadow-card border border-border/60 sm:rounded-[1.75rem] sm:p-8">
      <div className="mb-6">
        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          Catalog
        </div>
        <h1 className="text-2xl font-display font-bold gradient-text mb-2 sm:text-3xl">
          {id ? "Edit Product" : "Add Product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Add the details customers see, upload product images, then save it to this branch only.
        </p>
      </div>

      {id && (
        <div className="mb-6">
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
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />

        <input
          type="number"
          placeholder="Price (NPR)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
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
          placeholder="Short product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
          rows={3}
          required
        />

        <div className="space-y-3 rounded-2xl border border-border/70 bg-white/60 p-4">
          <div>
            <div className="text-sm font-semibold">
              Product Images
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Select up to {MAX_IMAGES} images, upload them, then choose the cover image.
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilePick(e.target.files)}
            className="w-full px-4 py-3 rounded-2xl bg-background/90 border border-border"
            disabled={uploading}
          />

          {activeImages.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">
                {form.imageUrls.length > 0
                  ? `${form.imageUrls.length} uploaded image${
                      form.imageUrls.length === 1 ? "" : "s"
                    }`
                  : `${selectedFiles.length} selected image${
                      selectedFiles.length === 1 ? "" : "s"
                    }`}
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
                Click an image to mark it as cover. Remove any image before saving.
              </p>
            </div>
          )}

          {/* ✅ Upload button only when local selected exists */}
          {selectedFiles.length > 0 && (
            <motion.button
              type="button"
              onClick={uploadImages}
              className="w-full py-3 rounded-2xl bg-card border border-border hover:border-primary transition font-semibold"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Selected Image${selectedFiles.length === 1 ? "" : "s"}`}
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

        <div className="space-y-4">
          <div className="text-sm font-semibold">Product Options</div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Ohms</div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 0.8"
                value={ohmInput}
                onChange={(e) => setOhmInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOhm();
                  }
                }}
              />
              <button
                type="button"
                onClick={addOhm}
                className="px-4 rounded-xl border border-border hover:border-primary transition"
              >
                Add
              </button>
            </div>

            {ohms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ohms.map((ohm: string) => (
                  <span
                    key={ohm}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20"
                  >
                    {ohm}
                    <button type="button" onClick={() => removeOhm(ohm)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Flavours</div>

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

          <div className="space-y-2">
            <div className="text-sm font-medium">Colours</div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Black"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColor();
                  }
                }}
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 rounded-xl border border-border hover:border-primary transition"
              >
                Add
              </button>
            </div>

            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colors.map((color: string) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm border border-primary/20"
                  >
                    {color}
                    <button type="button" onClick={() => removeColor(color)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
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
