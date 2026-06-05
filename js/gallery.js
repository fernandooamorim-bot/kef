window.WeddingGallery = {
  init() {
    const grid = document.getElementById("galleryGrid");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = lightbox?.querySelector("img");
    const closeButton = document.getElementById("closeLightbox");

    if (!grid || !lightbox || !lightboxImage) return;

    const fragment = document.createDocumentFragment();
    window.WEDDING_CONFIG.gallery.forEach((name, index) => {
      const full = `assets/images/gallery/${name}.jpg`;
      const thumb = `assets/images/thumbs/${name}.jpg`;
      const button = document.createElement("button");
      const image = document.createElement("img");

      button.className = "gallery__item reveal";
      button.type = "button";
      button.setAttribute("aria-label", `Ampliar foto ${index + 1} de Krisna e Fernando`);
      image.src = thumb;
      image.dataset.full = full;
      image.alt = `Krisna e Fernando - foto ${index + 1}`;
      image.loading = index < 4 ? "eager" : "lazy";
      image.decoding = "async";
      button.append(image);
      button.addEventListener("click", () => {
        lightboxImage.src = full;
        lightboxImage.alt = image.alt;
        lightbox.showModal();
      });
      fragment.append(button);
    });

    grid.append(fragment);
    closeButton?.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
};
