// ----- Navbar (every page) -----
const navbar = document.querySelector(".navbar");
const dropdown = document.querySelector(".dropdown");

document.querySelector(".menu-toggle").onclick = () => navbar.classList.toggle("mobile-open");
document.querySelector(".dropdown-toggle").onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
};
document.onclick = () => dropdown.classList.remove("open");


// ----- Home page: audience tabs -----
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".how-steps");

tabs.forEach((tab) => tab.onclick = () => {
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    panels.forEach((p) => p.hidden = p.id !== tab.dataset.tab);
});


// ----- Your listings (shared by the home page and the properties page) -----
// Add featured: true to show a listing on the home page.
const properties = [
    {
        title: "Luxurious 3BR Apartment",
        area: "Kilimani",
        type: "Apartment",
        listing: "rent",
        beds: 3,
        baths: 2,
        price: 120000,
        lat: -1.2921,
        lng: 36.8219,
        image: "images/property1.jpg",
        featured: true
    },
    {
    title: "Modern 2BR Apartment",
    area: "Westlands",
    type: "Apartment",
    listing: "rent",
    beds: 2,
    baths: 2,
    price: 85000,
    lat: -1.2676,
    lng: 36.8108,
    image: "images/property2.jpg",
    featured: true
},
{
    title: "4BR Family Home",
    area: "Lavington",
    type: "House",
    listing: "buy",
    beds: 4,
    baths: 4,
    price: 48000000,
    lat: -1.2833,
    lng: 36.7667,
    image: "images/property3.jpg",
    featured: true
},
];

// One function that builds a card, used on both pages
const card = (p) => `
    <article class="card">
        <div class="card-img">
            <span class="badge">For ${p.listing}</span>
            ${p.image ? `<img src="${p.image}" alt="${p.title}">` : `<i class="fa-solid fa-building"></i>`}
        </div>
        <div class="card-body">
            <p class="price">KES ${p.price.toLocaleString()}${p.listing === "rent" ? " / month" : ""}</p>
            <h3>${p.title}</h3>
            <p class="area"><i class="fa-solid fa-location-dot"></i> ${p.area}</p>
            <p class="specs">${p.beds} bed · ${p.baths} bath · ${p.type}</p>
            <a href="#" class="btn btn-orange card-btn">View details</a>
        </div>
    </article>`;


// ----- Home page: featured properties (only runs where #featured-list exists) -----
const featured = document.getElementById("featured-list");

if (featured) {
    featured.innerHTML = properties
        .filter((p) => p.featured)
        .slice(0, 3)
        .map(card)
        .join("") || `<p class="empty">No featured properties yet.</p>`;
}


// ----- Properties page (only runs where #results-list exists) -----
const list = document.getElementById("results-list");

if (list) {
    const $ = (id) => document.getElementById(id);
    const controls = document.querySelectorAll(".filter-bar select, .filter-bar input, #sort");

    $("location").value = new URLSearchParams(location.search).get("location") || "";

    const map = L.map("map").setView([-1.2921, 36.8219], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    const pins = L.layerGroup().addTo(map);

    function render() {
        const area = $("location").value.trim().toLowerCase();

        const matches = properties.filter((p) =>
            p.area.toLowerCase().includes(area) &&
            (!$("f-listing").value || p.listing === $("f-listing").value) &&
            (!$("f-type").value || p.type === $("f-type").value) &&
            p.beds >= $("f-beds").value &&
            p.price <= ($("f-max").value || Infinity)
        );

        if ($("sort").value === "low") matches.sort((a, b) => a.price - b.price);
        if ($("sort").value === "high") matches.sort((a, b) => b.price - a.price);

        const located = matches.filter((p) => p.lat && p.lng);
        pins.clearLayers();
        located.forEach((p) =>
            L.marker([p.lat, p.lng]).addTo(pins)
                .bindPopup(`<b>${p.title}</b><br>KES ${p.price.toLocaleString()}`)
        );
        if (located.length) {
            map.fitBounds(located.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 15 });
        }

        $("results-title").textContent = area ? `Properties in ${$("location").value.trim()}` : "All properties";
        $("results-count").textContent = `${matches.length} properties available`;

        list.innerHTML = matches.map(card).join("") || `<p class="empty">No properties found.</p>`;
    }

    controls.forEach((el) => el.oninput = render);
    $("filter-form").onsubmit = (e) => e.preventDefault();
    $("filter-form").onreset = () => setTimeout(render);
    render();
}