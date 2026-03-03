// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Close mobile menu when clicking outside of it
document.addEventListener('click', function(event) {
    if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Handle dropdown on mobile when menu is active
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) { // Mobile view
            e.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('active');
        }
    });
});

// Handle mobile menu dropdowns when menu is open
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
        const dropdownToggle = event.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            event.preventDefault();
            const dropdownMenu = dropdownToggle.nextElementSibling;
            const otherDropdowns = document.querySelectorAll('.dropdown-menu');

            // Close other dropdowns
            otherDropdowns.forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('active');
                }
            });

            // Toggle current dropdown
            dropdownMenu.classList.toggle('active');
        }
    }
});

// Theme toggle functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Check for saved theme preference or respect OS preference
const savedTheme = localStorage.getItem('theme');
const osPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else if (osPrefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    document.documentElement.setAttribute('data-theme', 'light');
}

// Theme toggle button
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTheme();

        // Update icon based on current theme
        const icon = themeToggle.querySelector('i');
        const currentTheme = document.documentElement.getAttribute('data-theme');

        if (currentTheme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });

    // Set initial icon based on current theme
    const icon = themeToggle.querySelector('i');
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active Navigation Link on Scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});


// Skill Bars Animation - Intersection Observer
const animateSkillBars = () => {
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillsSection = document.querySelector('.skills-content');

    // Add animation class to the skills container to trigger fade-in
    if (skillsSection) {
        skillsSection.style.opacity = '1';
        skillsSection.style.transform = 'translateY(0)';
    }

    skillBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate skill bars when skills section comes into view
            if (entry.target.id === 'skills') {
                animateSkillBars();
            }

            // Add appear effect for sections
            entry.target.classList.add('appear');
        }
    });
}, observerOptions);

// Observe sections for animations
document.querySelectorAll('section').forEach(section => {
    // Don't add fade-in class initially to prevent content from being hidden
    // The sections will be visible by default and then get 'appear' when scrolled to
    observer.observe(section);
});

// Optional: Typing Animation for Hero Section
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';

    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };

    // Start typing animation after a delay
    setTimeout(typeWriter, 1000);
}


// Add scroll-to-top functionality
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.classList.add('scroll-to-top');
document.body.appendChild(scrollToTopBtn);

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Show/hide scroll-to-top button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

// Initialize scroll-to-top button style
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: var(--transition);
    box-shadow: var(--shadow-lg);
`;

scrollToTopBtn.style.display = 'none';