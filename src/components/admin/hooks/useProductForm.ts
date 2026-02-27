import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Product } from "@/types/product";

const MAX_IMAGES = 3;

const clampCoverIndex = (len: number, desired: number) => {
  if (len <= 0) return 0;
  if (desired < 0) return 0;
  if (desired > len - 1) return 0;
  return desired;
};

export const useProductForm = (onSaved: () => void) => {
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // local files + previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // uploaded urls
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // flavors
  const [flavorInput, setFlavorInput] = useState("");
  const [flavors, setFlavors] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const canSubmit = !uploading && imageUrls.length > 0;

  const activeImages = useMemo(() => {
    return imageUrls.length > 0 ? imageUrls : previewUrls;
  }, [imageUrls, previewUrls]);

  const activeCover = useMemo(() => {
    return activeImages?.[coverIndex] || activeImages?.[0] || "";
  }, [activeImages, coverIndex]);

  const cleanupPreviews = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
  };

  const resetForm = () => {
    setId(null);
    setName("");
    setPrice("");
    setCategory("");
    setDescription("");

    cleanupPreviews();
    setSelectedFiles([]);
    setPreviewUrls([]);

    setImageUrls([]);
    setCoverIndex(0);

    setFlavors([]);
    setFlavorInput("");
    setMessage("");
  };

  const handleFilePick = (files: FileList | null) => {
    if (!files) return;

    const picked = Array.from(files);
    const merged = [...selectedFiles, ...picked].slice(0, MAX_IMAGES);

    cleanupPreviews();
    const previews = merged.map((f) => URL.createObjectURL(f));

    setSelectedFiles(merged);
    setPreviewUrls(previews);

    // preparing new upload set
    setImageUrls([]);
    setCoverIndex((prev) => clampCoverIndex(previews.length, prev));
    setMessage("");
  };

  const removeSelectedImage = (idx: number) => {
    const nextFiles = selectedFiles.filter((_, i) => i !== idx);

    cleanupPreviews();
    const nextPreviews = nextFiles.map((f) => URL.createObjectURL(f));

    setSelectedFiles(nextFiles);
    setPreviewUrls(nextPreviews);

    setCoverIndex((prevCover) => {
      if (idx === prevCover) return 0;
      if (idx < prevCover) return prevCover - 1;
      return clampCoverIndex(nextPreviews.length, prevCover);
    });
  };

  const removeUploadedImage = (idx: number) => {
    const nextUrls = imageUrls.filter((_, i) => i !== idx);
    setImageUrls(nextUrls);

    setCoverIndex((prevCover) => {
      if (idx === prevCover) return 0;
      if (idx < prevCover) return prevCover - 1;
      return clampCoverIndex(nextUrls.length, prevCover);
    });
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) {
      setMessage("Please select 1 to 3 images first ❗");
      return;
    }

    try {
      setUploading(true);
      setMessage("Uploading images... ⏳");

      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));

      const { res, data } = await api.uploadImages(formData);

      if (!res.ok) {
        setMessage(data?.message || data?.error || "Image upload failed ❌");
        return;
      }

      if (Array.isArray(data.imageUrls) && data.imageUrls.length) {
        setImageUrls(data.imageUrls.slice(0, MAX_IMAGES));

        cleanupPreviews();
        setSelectedFiles([]);
        setPreviewUrls([]);

        setCoverIndex((prev) => clampCoverIndex(data.imageUrls.length, prev));
        setMessage("Images uploaded ✅");
      } else {
        setMessage("Image upload failed ❌");
      }
    } catch (e) {
      console.error(e);
      setMessage("Image upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

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

  const editProduct = (product: Product) => {
    setId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description);

    setImageUrls((product.imageUrl || []).slice(0, MAX_IMAGES));
    setCoverIndex(
      Number.isFinite(product.coverIndex)
        ? clampCoverIndex((product.imageUrl || []).length, product.coverIndex)
        : 0
    );

    cleanupPreviews();
    setSelectedFiles([]);
    setPreviewUrls([]);

    setFlavors((product.flavors || []).map((f) => f.name));
    setFlavorInput("");
    setMessage("");
  };

  const save = async () => {
    if (uploading) {
      setMessage("Please wait for image upload to finish ❗");
      return;
    }
    if (!imageUrls.length) {
      setMessage("Please upload images before saving product ❗");
      return;
    }

    const safeCover = clampCoverIndex(imageUrls.length, coverIndex);

    const payload = {
      name,
      price: Number(price),
      category,
      description,
      imageUrl: imageUrls,
      coverIndex: safeCover,
      flavors,
    };

    const { res, data } = await api.saveProduct(payload, id);

    if (!res.ok) {
      setMessage(data?.message || data?.error || "Error saving product ❌");
      return;
    }

    setMessage(id ? "Product updated successfully ✅" : "Product created successfully ✅");
    onSaved();
    resetForm();
  };

  return {
    MAX_IMAGES,
    canSubmit,
    // state
    id,
    name,
    price,
    category,
    description,
    selectedFiles,
    previewUrls,
    imageUrls,
    coverIndex,
    flavorInput,
    flavors,
    message,
    uploading,
    activeImages,
    activeCover,

    // setters
    setName,
    setPrice,
    setCategory,
    setDescription,
    setCoverIndex,
    setFlavorInput,

    // actions
    resetForm,
    handleFilePick,
    removeSelectedImage,
    removeUploadedImage,
    uploadImages,
    addFlavor,
    removeFlavor,
    editProduct,
    save,
  };
};