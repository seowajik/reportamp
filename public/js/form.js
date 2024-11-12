let formHandler;

// Theme management
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");

  // Set initial theme
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.checked = currentTheme === "dark";

  // Theme toggle handler
  themeToggle.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
});

class FormHandler {
  constructor() {
    this.form = document.getElementById("reportForm");
    this.brandsContainer = document.getElementById("brands-container");
    this.addBrandBtn = document.getElementById("add-brand");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.addBrandBtn.addEventListener("click", () => this.addBrand());
    document.addEventListener("click", (e) => this.handleGlobalClick(e));

    // Handle AMP status changes using event delegation
    this.form.addEventListener("change", (e) => {
      if (e.target.classList.contains("amp-status-select")) {
        this.handleAmpStatusChange(e.target);
      }
    });

    // Input validation listeners
    this.form.addEventListener("input", (e) => this.handleInput(e));
  }

  handleAmpStatusChange(selectElement) {
    const urlEntry = selectElement.closest(".url-entry");
    const ampUrlContainer = urlEntry.querySelector(".amp-url-container");
    const ampUrlInput = ampUrlContainer.querySelector(".amp-url-input");

    if (selectElement.value === "true") {
      ampUrlContainer.style.display = "block";
      ampUrlInput.required = true;
    } else {
      ampUrlContainer.style.display = "none";
      ampUrlInput.required = false;
      ampUrlInput.value = "";
    }
  }

  handleInput(e) {
    const input = e.target;
    if (input.hasAttribute("required")) {
      this.validateInput(input);
    }
  }

  validateInput(input) {
    const isValid = input.checkValidity();
    const formControl = input.closest(".form-control");

    if (formControl) {
      const errorMessage =
        formControl.querySelector(".error-message") ||
        this.createErrorMessage(formControl);

      if (!isValid) {
        errorMessage.textContent = input.validationMessage;
        input.classList.add("input-error");
      } else {
        errorMessage.textContent = "";
        input.classList.remove("input-error");
      }
    }
  }

  createErrorMessage(formControl) {
    const errorMessage = document.createElement("span");
    errorMessage.className = "text-error text-sm error-message mt-1";
    formControl.appendChild(errorMessage);
    return errorMessage;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.showLoading();

    try {
      const formData = this.collectFormData();
      const response = await this.submitForm(formData);

      if (response.success) {
        this.hideLoading();
        this.showSuccess();
        setTimeout(() => {
          window.location.href = `/reports/${response.reportId}`;
        }, 1500);
      } else {
        throw new Error(response.error || "Failed to generate report");
      }
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      console.error("Form submission error:", error);
    }
  }

  validateForm() {
    let isValid = true;
    const requiredInputs = this.form.querySelectorAll("[required]");

    requiredInputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        this.validateInput(input);
      }
    });

    // Validate AMP URLs
    this.form.querySelectorAll(".amp-status-select").forEach((select) => {
      if (select.value === "true") {
        const urlEntry = select.closest(".url-entry");
        const ampUrlInput = urlEntry.querySelector(".amp-url-input");
        if (!ampUrlInput.value) {
          isValid = false;
          ampUrlInput.classList.add("input-error");
          this.showError("AMP URL is required when AMP is active");
        } else {
          ampUrlInput.classList.remove("input-error");
        }
      }
    });

    return isValid;
  }

  collectFormData() {
    const formData = {
      owner: this.form.querySelector('[name="owner"]').value,
      attention: this.form.querySelector('[name="attention"]').value,
      updates: this.form.querySelector('[name="updates"]').value,
      brands: [],
    };

    this.form
      .querySelectorAll(".brand-entry")
      .forEach((brandEntry, brandIndex) => {
        const brand = {
          name: brandEntry.querySelector(`[name="brands[${brandIndex}][name]"]`)
            .value,
          urls: [],
        };

        brandEntry.querySelectorAll(".url-entry").forEach((urlEntry) => {
          const ampStatus =
            urlEntry.querySelector(".amp-status-select").value === "true";
          const urlData = {
            url: urlEntry.querySelector('[name*="[url]"]').value,
            rank: urlEntry.querySelector('[name*="[rank]"]').value,
            ampStatus: ampStatus,
          };

          // Add ampUrl if AMP is active
          if (ampStatus) {
            const ampUrlInput = urlEntry.querySelector(".amp-url-input");
            if (ampUrlInput && ampUrlInput.value) {
              urlData.ampUrl = ampUrlInput.value;
            }
          }

          brand.urls.push(urlData);
        });

        formData.brands.push(brand);
      });
    return formData;
  }

  async submitForm(data) {
    const response = await fetch("/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  addBrand() {
    const brandCount = this.form.querySelectorAll(".brand-entry").length;
    const newBrand = this.createBrandElement(brandCount);

    this.brandsContainer.insertAdjacentHTML("beforeend", newBrand);
    const brandElement = this.brandsContainer.lastElementChild;

    brandElement.classList.add("fade-in");
    brandElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createBrandElement(index) {
    return `
      <div class="brand-entry card bg-base-200 shadow-sm hover-shadow">
        <div class="card-body">
          <div class="flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="badge badge-primary badge-lg">Brand ${
                index + 1
              }</span>
            </div>
            <button type="button" class="btn btn-error btn-sm remove-brand">
              <i class="fas fa-trash mr-2"></i>
              Remove Brand
            </button>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Brand Name</span>
              <span class="label-text-alt text-error">Required</span>
            </label>
            <input type="text" 
                   name="brands[${index}][name]" 
                   class="input input-bordered" 
                   placeholder="Enter brand name"
                   required />
          </div>

          <div class="urls-container space-y-4 mt-4">
            ${this.createUrlElement(index, 0)}
          </div>

          <div class="card-actions mt-4">
            <button type="button" class="btn btn-secondary btn-sm add-url">
              <i class="fas fa-plus mr-2"></i>
              Add URL
            </button>
          </div>
        </div>
      </div>
    `;
  }

  createUrlElement(brandIndex, urlIndex) {
    return `
      <div class="url-entry card bg-base-100 hover-shadow fade-in">
        <div class="card-body p-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">URL</span>
                  <span class="label-text-alt text-error">Required</span>
                </label>
                <input type="url" 
                       name="brands[${brandIndex}][urls][${urlIndex}][url]" 
                       class="input input-bordered"
                       placeholder="https://example.com"
                       required />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Rank</span>
                  <span class="label-text-alt text-error">Required</span>
                </label>
                <input type="number" 
                       name="brands[${brandIndex}][urls][${urlIndex}][rank]" 
                       class="input input-bordered"
                       min="1"
                       placeholder="Enter rank"
                       required />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">AMP Status</span>
                </label>
                <select name="brands[${brandIndex}][urls][${urlIndex}][ampStatus]" 
                        class="select select-bordered amp-status-select">
                  <option value="false">Inactive</option>
                  <option value="true">Active</option>
                </select>
              </div>

              <div class="form-control amp-url-container" style="display: none;">
                <label class="label">
                  <span class="label-text font-medium">AMP URL</span>
                  <span class="label-text-alt text-error">Required when AMP is active</span>
                </label>
                <input type="url" 
                       name="brands[${brandIndex}][urls][${urlIndex}][ampUrl]" 
                       class="input input-bordered amp-url-input"
                       placeholder="https://amp.example.com" />
              </div>
            </div>

            <div class="flex justify-end">
              <button type="button" class="btn btn-error btn-sm remove-url">
                <i class="fas fa-times mr-2"></i>
                Remove URL
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleGlobalClick(e) {
    if (e.target.closest(".add-url")) {
      this.handleAddUrl(e);
    } else if (e.target.closest(".remove-url")) {
      this.handleRemoveUrl(e);
    } else if (e.target.closest(".remove-brand")) {
      this.handleRemoveBrand(e);
    }
  }

  handleAddUrl(e) {
    const brandEntry = e.target.closest(".brand-entry");
    const brandIndex = Array.from(
      this.form.querySelectorAll(".brand-entry")
    ).indexOf(brandEntry);
    const urlsContainer = brandEntry.querySelector(".urls-container");
    const urlCount = urlsContainer.querySelectorAll(".url-entry").length;

    urlsContainer.insertAdjacentHTML(
      "beforeend",
      this.createUrlElement(brandIndex, urlCount)
    );
    const newUrl = urlsContainer.lastElementChild;
    newUrl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  handleRemoveUrl(e) {
    const urlEntry = e.target.closest(".url-entry");
    const urlsContainer = urlEntry.closest(".urls-container");

    if (urlsContainer.querySelectorAll(".url-entry").length > 1) {
      urlEntry.classList.add("fade-out");
      setTimeout(() => {
        urlEntry.remove();
        this.updateIndices();
      }, 300);
    } else {
      this.showError("At least one URL is required per brand");
    }
  }

  handleRemoveBrand(e) {
    const brandEntry = e.target.closest(".brand-entry");

    if (this.form.querySelectorAll(".brand-entry").length > 1) {
      brandEntry.classList.add("fade-out");
      setTimeout(() => {
        brandEntry.remove();
        this.updateIndices();
      }, 300);
    } else {
      this.showError("At least one brand is required");
    }
  }

  updateIndices() {
    this.form.querySelectorAll(".brand-entry").forEach((brand, brandIndex) => {
      brand.querySelector(".badge").textContent = `Brand ${brandIndex + 1}`;

      const brandNameInput = brand.querySelector('[name*="[name]"]');
      brandNameInput.name = `brands[${brandIndex}][name]`;

      brand.querySelectorAll(".url-entry").forEach((url, urlIndex) => {
        const inputs = url.querySelectorAll('[name*="[urls]"]');
        inputs.forEach((input) => {
          const nameEnd = input.name.match(/\[[^\]]*\]$/)[0];
          input.name = `brands[${brandIndex}][urls][${urlIndex}]${nameEnd}`;
        });
      });
    });
  }

  showLoading() {
    document.getElementById("loading-modal").showModal();
  }

  hideLoading() {
    document.getElementById("loading-modal").close();
  }

  showSuccess() {
    document.getElementById("success-modal").showModal();
  }

  showError(message) {
    document.getElementById("error-message").textContent = message;
    document.getElementById("error-modal").showModal();
  }
}

// Initialize form handler globally
window.formHandler = new FormHandler();
