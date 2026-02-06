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

    // Booking Form Handler (Redirect to booking.html)
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;

            if (!checkIn || !checkOut) {
                alert('체크인과 체크아웃 날짜를 선택해주세요.');
                return;
            }

            // Redirect to booking page with params
            window.location.href = `booking.html?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`;
        });
    }

    // Check Auth Status on Load (Keep existing)
    checkAuthStatus();
});

// Auth Status Check & UI Update
async function checkAuthStatus() {
    if (typeof supabase === 'undefined' || !supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    const navLinks = document.querySelector('.nav-links');

    if (!navLinks) return;

    // Remove existing login/signup/logout items to rebuild
    const authItems = navLinks.querySelectorAll('.auth-item');
    authItems.forEach(item => item.remove());

    if (user) {
        // Logged In
        const myPageLi = document.createElement('li');
        myPageLi.className = 'auth-item';
        myPageLi.innerHTML = `<a href="mypage.html">마이페이지</a>`;
        navLinks.appendChild(myPageLi);

        const logoutLi = document.createElement('li');
        logoutLi.className = 'auth-item';
        logoutLi.innerHTML = `<a href="#" onclick="handleLogout(event)">로그아웃</a>`;
        navLinks.appendChild(logoutLi);
    } else {
        // Logged Out
        // 로그인/회원가입 버튼이 없으면 추가
        const loginLi = document.createElement('li');
        loginLi.className = 'auth-item';
        loginLi.innerHTML = `<a href="login.html">로그인</a>`;
        navLinks.appendChild(loginLi);

        const signupLi = document.createElement('li');
        signupLi.className = 'auth-item';
        signupLi.innerHTML = `<a href="signup.html" class="btn-reserve">회원가입</a>`;
        navLinks.appendChild(signupLi);
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
