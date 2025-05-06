// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mobileToggle = document.getElementById('mobile-toggle');
const sidebarToggle = document.getElementById('sidebar-toggle');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const navLinks = document.querySelectorAll('.sidebar-nav a');

// Toggles for mobile sidebar
function toggleSidebar() {
  sidebar.classList.toggle('open');
}

if (mobileToggle) {
  mobileToggle.addEventListener('click', toggleSidebar);
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', toggleSidebar);
}

// Close sidebar when clicking outside
document.addEventListener('click', (event) => {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnSidebarToggle = sidebarToggle && sidebarToggle.contains(event.target);
  
  if (!isClickInsideSidebar && !isClickOnSidebarToggle && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
});

// Search functionality
function getSearchableItems() {
  const items = [];
  
  // Get all section headings
  document.querySelectorAll('.doc-section h1').forEach(heading => {
    const id = heading.closest('section').id;
    items.push({
      id,
      title: heading.textContent.trim(),
      type: 'Section'
    });
  });
  
  // Get all subsection headings
  document.querySelectorAll('.doc-subsection h2').forEach(heading => {
    const id = heading.closest('div').id;
    items.push({
      id,
      title: heading.textContent.trim(),
      type: 'Subsection'
    });
  });
  
  return items;
}

function search(query) {
  if (!query || query.length < 2) {
    searchResults.innerHTML = '';
    searchResults.classList.remove('show');
    return;
  }
  
  const items = getSearchableItems();
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );
  
  if (filteredItems.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
  } else {
    searchResults.innerHTML = filteredItems.map(item => `
      <div class="search-result-item" data-id="${item.id}">
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-type">${item.type}</div>
      </div>
    `).join('');
    
    // Add click event to search results
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          searchResults.classList.remove('show');
          searchInput.value = '';
          window.location.hash = id;
          
          // Close sidebar on mobile after selecting an item
          if (window.innerWidth < 992) {
            sidebar.classList.remove('open');
          }
        }
      });
    });
  }
  
  searchResults.classList.add('show');
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    search(e.target.value);
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (event) => {
    const isClickInsideSearch = searchInput.contains(event.target) || searchResults.contains(event.target);
    
    if (!isClickInsideSearch && searchResults.classList.contains('show')) {
      searchResults.classList.remove('show');
    }
  });
  
  // Clear search and close results on Escape key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchResults.classList.remove('show');
    }
  });
}

// Update active link on scroll
function updateActiveLink() {
  const scrollPosition = window.scrollY;
  
  // Get all sections
  const sections = document.querySelectorAll('.doc-section, .doc-subsection');
  
  // Find the current section
  let currentSection = '';
  
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionTop + sectionHeight - 100) {
      currentSection = section.id;
    }
  });
  
  // Update active class in the sidebar
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    if (href === `#${currentSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Throttle function to limit scroll event
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Add smooth scrolling to anchor links
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    
    if (targetId.startsWith('#')) {
      e.preventDefault();
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Scroll to target with offset for header
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Update URL hash without scrolling
        history.pushState(null, null, targetId);
        
        // Close sidebar on mobile after clicking
        if (window.innerWidth < 992) {
          sidebar.classList.remove('open');
        }
      }
    }
  });
});

// Initialize
window.addEventListener('scroll', throttle(updateActiveLink, 100));
document.addEventListener('DOMContentLoaded', updateActiveLink);

// Update active link when hash changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  
  if (hash) {
    const targetElement = document.querySelector(hash);
    
    if (targetElement) {
      // Scroll to target with offset for header
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
      
      // Update active class
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === hash) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
});