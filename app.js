document.addEventListener('DOMContentLoaded', () => {

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Simple Booking Form Handler
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 로그인 상태 확인
            checkLoginStatusForBooking();
        });
    }

    // Check Auth Status on Load
    checkAuthStatus();
});

// Auth Status Check & UI Update
async function checkAuthStatus() {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    const navLinks = document.querySelector('.nav-links');

    // Remove existing login/signup/logout items to rebuild
    const authItems = navLinks.querySelectorAll('.auth-item');
    authItems.forEach(item => item.remove());

    if (user) {
        // Logged In
        const logoutLi = document.createElement('li');
        logoutLi.className = 'auth-item';
        logoutLi.innerHTML = `<a href="#" onclick="handleLogout(event)">로그아웃</a>`;
        navLinks.appendChild(logoutLi);

        // Optional: Show user name or My Page link
        // const myPageLi = document.createElement('li'); ...
    } else {
        // Logged Out (Default links are in HTML, but we can ensure they are there)
        // If we want to strictly manage via JS, we can clear and add.
        // For now, index.html has static links. 
        // We might want to replace static Login/Signup with dynamic ones if strict control is needed.
        // But for simplicity with static HTML, we can just hide/show if we tag them properly.
    }
}

async function handleLogout(e) {
    e.preventDefault();
    if (confirm('로그아웃 하시겠습니까?')) {
        await signOut();
        window.location.reload();
    }
}

async function checkLoginStatusForBooking() {
    if (!supabase) {
        alert('예약 시스템 준비 중입니다.');
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        alert('예약 페이지로 이동합니다. (준비 중)');
        // window.location.href = 'booking.html';
    } else {
        if (confirm('예약을 위해서는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
    }
}
