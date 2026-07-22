"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/cms/Topbar";
import {
  subscribePartners,
  addPartner,
  updatePartner,
  deletePartner,
  Partner,
  subscribeFeaturedPartners,
  addFeaturedPartner,
  updateFeaturedPartner,
  deleteFeaturedPartner,
  FeaturedPartner,
  FocusCard,
} from "@/lib/firestore";
import { uploadFile, generateStoragePath } from "@/lib/storage";
import { Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";

export default function PartnersPage() {
  const [activeTab, setActiveTab] = useState<"partners" | "featured">("partners");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [featuredPartners, setFeaturedPartners] = useState<FeaturedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "govt" | "institutional" | "tech">("all");

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    const unsubP = subscribePartners((data) => {
      setPartners(data);
    });
    unsubs.push(unsubP);

    const unsubFP = subscribeFeaturedPartners((data) => {
      setFeaturedPartners(data);
      setLoading(false);
    });
    unsubs.push(unsubFP);

    return () => unsubs.forEach((u) => u());
  }, []);

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  };

  // --- REGULAR PARTNERS HANDLERS ---
  const handleAddPartner = async () => {
    try {
      await addPartner({
        name: "New Partner",
        category: "govt",
        featured: false,
        order: partners.length,
      });
      showStatus("Partner added!");
    } catch (e) {
      console.error(e);
      showStatus("Error adding partner.");
    }
  };

  const handleUpdatePartner = async (id: string, field: keyof Partner, value: Partner[keyof Partner]) => {
    try {
      await updatePartner(id, { [field]: value });
    } catch (e) {
      console.error(e);
      showStatus("Error updating partner.");
    }
  };

  const handleLogoUpload = async (id: string, file: File) => {
    try {
      showStatus("Uploading logo...");
      const path = generateStoragePath("partners", file);
      const url = await uploadFile(file, path);
      await updatePartner(id, { logoUrl: url });
      showStatus("Logo uploaded!");
    } catch (e) {
      console.error(e);
      showStatus("Error uploading logo.");
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      try {
        await deletePartner(id);
        showStatus("Partner deleted!");
      } catch (e) {
        console.error(e);
        showStatus("Error deleting partner.");
      }
    }
  };

  const filteredPartners = partners.filter((p) =>
    categoryFilter === "all" ? true : p.category === categoryFilter
  );

  // --- FEATURED PARTNERS HANDLERS ---
  const handleAddFeaturedPartner = async () => {
    try {
      await addFeaturedPartner({
        name: "New Featured Partner",
        tagline: "",
        meta: "",
        description: "",
        initials: "FP",
        logoUrl: "",
        focusCards: [],
        gallery: [],
        contactEmail: "",
        type: "fablab",
        order: featuredPartners.length,
      });
      showStatus("Featured partner added!");
    } catch (e) {
      console.error(e);
      showStatus("Error adding featured partner.");
    }
  };

  const handleUpdateFeaturedPartner = async (id: string, field: keyof FeaturedPartner, value: FeaturedPartner[keyof FeaturedPartner]) => {
    try {
      await updateFeaturedPartner(id, { [field]: value });
    } catch (e) {
      console.error(e);
      showStatus("Error updating featured partner.");
    }
  };

  const handleFeaturedLogoUpload = async (id: string, file: File) => {
    try {
      showStatus("Uploading logo...");
      const path = generateStoragePath("featured-partners", file);
      const url = await uploadFile(file, path);
      await updateFeaturedPartner(id, { logoUrl: url });
      showStatus("Logo uploaded!");
    } catch (e) {
      console.error(e);
      showStatus("Error uploading logo.");
    }
  };

  const handleGalleryUpload = async (id: string, files: FileList, currentGallery: string[]) => {
    try {
      showStatus("Uploading gallery images...");
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = generateStoragePath("featured-partners/gallery", file);
        const url = await uploadFile(file, path);
        urls.push(url);
      }
      await updateFeaturedPartner(id, { gallery: [...currentGallery, ...urls] });
      showStatus("Gallery updated!");
    } catch (e) {
      console.error(e);
      showStatus("Error uploading gallery images.");
    }
  };

  const handleRemoveGalleryImage = async (id: string, indexToRemove: number, currentGallery: string[]) => {
    const updatedGallery = currentGallery.filter((_, idx) => idx !== indexToRemove);
    await updateFeaturedPartner(id, { gallery: updatedGallery });
  };

  const handleFocusCardChange = async (fpId: string, cards: FocusCard[], idx: number, field: keyof FocusCard, val: string) => {
    const updated = [...cards];
    updated[idx] = { ...updated[idx], [field]: val };
    await updateFeaturedPartner(fpId, { focusCards: updated });
  };

  const handleAddFocusCard = async (fpId: string, cards: FocusCard[]) => {
    const updated = [...cards, { icon: "Award", title: "New Focus", body: "Description" }];
    await updateFeaturedPartner(fpId, { focusCards: updated });
  };

  const handleRemoveFocusCard = async (fpId: string, cards: FocusCard[], idx: number) => {
    const updated = cards.filter((_, i) => i !== idx);
    await updateFeaturedPartner(fpId, { focusCards: updated });
  };

  const handleDeleteFeaturedPartner = async (id: string) => {
    if (confirm("Delete this featured partner?")) {
      try {
        await deleteFeaturedPartner(id);
        showStatus("Featured partner deleted!");
      } catch (e) {
        console.error(e);
        showStatus("Error deleting.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Partners" breadcrumb="Partners" />
        <main className="flex-1 px-8 py-8 flex items-center justify-center">
          <div className="text-var(--cms-muted)">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Partners Manager" breadcrumb="Partners" />
      
      {/* STATUS TOAST */}
      {status && (
        <div className="fixed bottom-4 right-4 bg-var(--cms-surface-2) border border-var(--cms-border) px-4 py-2 rounded-lg text-sm text-var(--cms-text) z-50">
          {status}
        </div>
      )}

      <main className="flex-1 px-8 py-8 space-y-6 animate-fade-in w-full">
        
        {/* TABS */}
        <div className="flex space-x-4 border-b border-[var(--cms-border)] pb-2">
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
              activeTab === "partners"
                ? "text-[var(--cms-accent)] border-b-2 border-[var(--cms-accent)]"
                : "text-[var(--cms-text-2)] hover:text-[var(--cms-text)]"
            }`}
          >
            Regular Partners
          </button>
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
              activeTab === "featured"
                ? "text-[var(--cms-accent)] border-b-2 border-[var(--cms-accent)]"
                : "text-[var(--cms-text-2)] hover:text-[var(--cms-text)]"
            }`}
          >
            Featured Partners
          </button>
        </div>

        {/* --- PARTNERS TAB --- */}
        {activeTab === "partners" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {(["all", "govt", "institutional", "tech"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      categoryFilter === cat
                        ? "bg-[var(--cms-accent)] text-white"
                        : "bg-[var(--cms-surface-2)] text-[var(--cms-text-2)] hover:text-white"
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddPartner}
                className="flex items-center px-4 py-2 bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((p) => (
                <div key={p.id} className="cms-card p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      className="cms-input font-bold"
                      value={p.name}
                      onChange={(e) => handleUpdatePartner(p.id, "name", e.target.value)}
                      placeholder="Partner Name"
                    />
                    <button
                      onClick={() => handleDeletePartner(p.id)}
                      className="p-2 bg-[var(--cms-surface-2)] text-[var(--cms-danger)] rounded-lg hover:bg-[var(--cms-danger)] hover:text-white transition-colors ml-2"
                      title="Delete Partner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Category
                      </label>
                      <select
                        className="cms-input w-full"
                        value={p.category}
                        onChange={(e) => handleUpdatePartner(p.id, "category", e.target.value)}
                      >
                        <option value="govt">Govt</option>
                        <option value="institutional">Institutional</option>
                        <option value="tech">Tech</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Featured
                      </label>
                      <label className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          checked={p.featured}
                          onChange={(e) => handleUpdatePartner(p.id, "featured", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-[var(--cms-surface-2)] text-[var(--cms-accent)]"
                        />
                        <span className="text-sm text-[var(--cms-text-2)]">Show in featured row</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                      Logo Upload
                    </label>
                    <div className="flex items-center space-x-4">
                      {p.logoUrl && (
                        <div className="w-12 h-12 bg-white rounded-md p-1 overflow-hidden">
                          <img src={p.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <label className="flex items-center px-3 py-1.5 bg-[var(--cms-surface-2)] hover:bg-[var(--cms-border)] text-sm rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleLogoUpload(p.id, e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPartners.length === 0 && (
                <div className="col-span-full py-12 text-center text-[var(--cms-muted)]">
                  No partners found for this category.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- FEATURED PARTNERS TAB --- */}
        {activeTab === "featured" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handleAddFeaturedPartner}
                className="flex items-center px-4 py-2 bg-[var(--cms-accent)] hover:bg-[var(--cms-accent-hover)] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Featured Partner
              </button>
            </div>

            <div className="space-y-8">
              {featuredPartners.map((fp) => (
                <div key={fp.id} className="cms-card p-6 space-y-6">
                  
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Name
                      </label>
                      <input
                        className="cms-input text-lg font-bold"
                        value={fp.name}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "name", e.target.value)}
                        placeholder="Partner Name"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteFeaturedPartner(fp.id)}
                      className="p-2 bg-[var(--cms-surface-2)] text-[var(--cms-danger)] rounded-lg hover:bg-[var(--cms-danger)] hover:text-white transition-colors mt-6"
                      title="Delete Featured Partner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Type
                      </label>
                      <select
                        className="cms-input w-full"
                        value={fp.type}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "type", e.target.value)}
                      >
                        <option value="fablab">Fab Lab</option>
                        <option value="learning">Learning Partner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Initials
                      </label>
                      <input
                        className="cms-input w-full"
                        value={fp.initials}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "initials", e.target.value)}
                        placeholder="e.g. FL"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Contact Email
                      </label>
                      <input
                        className="cms-input w-full"
                        value={fp.contactEmail}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "contactEmail", e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Tagline
                      </label>
                      <input
                        className="cms-input w-full"
                        value={fp.tagline}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "tagline", e.target.value)}
                        placeholder="Short descriptive tagline"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                        Meta Info
                      </label>
                      <input
                        className="cms-input w-full"
                        value={fp.meta}
                        onChange={(e) => handleUpdateFeaturedPartner(fp.id, "meta", e.target.value)}
                        placeholder="e.g. Since 2020 / Partner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--cms-muted)] mb-1">
                      Description
                    </label>
                    <textarea
                      className="cms-input w-full min-h-[100px]"
                      value={fp.description}
                      onChange={(e) => handleUpdateFeaturedPartner(fp.id, "description", e.target.value)}
                      placeholder="Detailed description of the partnership..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)] mb-3 border-b border-[var(--cms-border)] pb-2">
                      Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      {fp.logoUrl && (
                        <div className="w-20 h-20 bg-white rounded-lg p-2 overflow-hidden shadow-sm">
                          <img src={fp.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <label className="flex items-center px-4 py-2 bg-[var(--cms-surface-2)] hover:bg-[var(--cms-border)] text-sm font-semibold rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        {fp.logoUrl ? "Change Logo" : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFeaturedLogoUpload(fp.id, e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Focus Cards Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-[var(--cms-border)] pb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
                        Focus Cards
                      </label>
                      <button
                        onClick={() => handleAddFocusCard(fp.id, fp.focusCards)}
                        className="flex items-center text-xs text-[var(--cms-accent)] hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Card
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fp.focusCards.map((card, idx) => (
                        <div key={idx} className="bg-[var(--cms-surface-2)] p-4 rounded-lg relative group">
                          <button
                            onClick={() => handleRemoveFocusCard(fp.id, fp.focusCards, idx)}
                            className="absolute top-2 right-2 p-1 text-[var(--cms-muted)] hover:text-[var(--cms-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-3">
                            <div>
                               <input
                                className="cms-input w-full text-sm font-bold bg-[var(--cms-surface)] border-none"
                                value={card.title}
                                onChange={(e) => handleFocusCardChange(fp.id, fp.focusCards, idx, "title", e.target.value)}
                                placeholder="Title"
                              />
                            </div>
                            <div className="flex space-x-2">
                               <input
                                className="cms-input w-1/3 text-xs bg-[var(--cms-surface)] border-none"
                                value={card.icon}
                                onChange={(e) => handleFocusCardChange(fp.id, fp.focusCards, idx, "icon", e.target.value)}
                                placeholder="Lucide Icon"
                              />
                               <textarea
                                className="cms-input w-2/3 text-xs min-h-[60px] bg-[var(--cms-surface)] border-none"
                                value={card.body}
                                onChange={(e) => handleFocusCardChange(fp.id, fp.focusCards, idx, "body", e.target.value)}
                                placeholder="Body text"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {fp.focusCards.length === 0 && (
                        <div className="col-span-full py-4 text-center text-xs text-[var(--cms-muted)]">
                          No focus cards added.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-[var(--cms-border)] pb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[var(--cms-muted)]">
                        Image Gallery
                      </label>
                      <label className="flex items-center text-xs text-[var(--cms-accent)] hover:text-white transition-colors cursor-pointer">
                        <Plus className="w-3 h-3 mr-1" /> Add Images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              handleGalleryUpload(fp.id, e.target.files, fp.gallery);
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {fp.gallery.map((url, idx) => (
                        <div key={idx} className="relative group aspect-video bg-[var(--cms-surface-2)] rounded-lg overflow-hidden border border-[var(--cms-border)]">
                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveGalleryImage(fp.id, idx, fp.gallery)}
                              className="p-2 bg-[var(--cms-danger)] text-white rounded-full hover:bg-red-600 transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {fp.gallery.length === 0 && (
                        <div className="col-span-full py-6 text-center flex flex-col items-center justify-center text-[var(--cms-muted)]">
                           <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                           <span className="text-xs">No images in gallery.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
              
              {featuredPartners.length === 0 && (
                <div className="py-12 text-center text-[var(--cms-muted)] cms-card">
                  No featured partners added yet.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
