document.addEventListener('DOMContentLoaded', () => {
    // Navigation Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Mobile Sidebar Toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !menuBtn.contains(e.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Initialize CSS Charts
    const initCharts = () => {
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach(bar => {
            const val = bar.getAttribute('data-value-percent');
            if (val) {
                // Set height after a small delay to trigger CSS transition
                setTimeout(() => {
                    bar.style.height = `${val}%`;
                }, 100);
            }
        });
    };

    initCharts();

    // Simple Search Filter Simulation
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const tableRows = document.querySelectorAll('.data-table tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // User Dropdown (Simplified)
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            console.log('User profile clicked - logic to show dropdown could go here');
        });
    }
});
