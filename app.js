document.addEventListener('DOMContentLoaded', () => {
    renderRooms(); // Render rooms on load

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

    // Improve Date Input JS
    // Make clicking anywhere on the date input open the picker
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.style.cursor = 'pointer';
        input.addEventListener('click', (e) => {
            // Prevent default to avoid conflict if browser handles it weirdly needed?
            // Usually simply calling showPicker is enough.
            if ('showPicker' in HTMLInputElement.prototype) {
                try {
                    input.showPicker();
                } catch (err) {
                    // Ignore errors (e.g. if already open or not supported)
                }
            }
        });
    });

    // Improve Select Input Cursor
    const selectInputs = document.querySelectorAll('select');
    selectInputs.forEach(select => {
        select.style.cursor = 'pointer';
    });

    // Initialize Slideshow
    initSlideshow();
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
        // Admin Check (Simple Email Check)
        const ADMIN_EMAILS = ['dimplekiller@daum.net', 'sokchovac@naver.com'];
        if (ADMIN_EMAILS.includes(user.email)) {
            const adminLi = document.createElement('li');
            adminLi.className = 'auth-item';
            adminLi.innerHTML = `<a href="admin.html" style="color:#ff4757; font-weight:bold;">관리자</a>`;
            navLinks.appendChild(adminLi);
        }

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

// Room Data - Extended Details (Local Override/Supplement)
const roomTags = {
    '스탠다드 더블': ['기준 2인', 'Queen Bed'],
    '스탠다드 트윈': ['기준 2인', '최대 3인(유료)', 'Queen + Single'],
    '다이닝 룸': ['기준 2인', '최대 4인(유료)', '2 Queen Beds', 'Dining Table'],
    '무비 다이닝': ['기준 2인', '최대 4인(유료)', '다이닝+시네마', '대형스크린', '취사가능'],
    '무비': ['기준 2인', '최대 4인(유료)', '시네마', '사운드바', '취사가능'],
    '플레이': ['기준 2인', '최대 4인(유료)', '엔터테인먼트', '친구/커플', '취사가능'],
    '키즈 룸': ['기준 2인', '최대 4인(유료)', '가족여행', '아동친화', '취사가능'],
    '비즈니스': ['기준 2인', '최대 4인(유료)', '출장/업무', 'Workstation', '취사가능'],
    '웰니스': ['기준 2인', '최대 4인(유료)', '힐링', '프리미엄', '취사가능']
};

const roomImages = {
    '스탠다드 더블': ['images/room-double.jpg', 'images/room-double-bath.jpg'],
    '스탠다드 트윈': ['images/room-twin.jpg', 'images/room-double-bath.jpg', 'images/room-twin-view.jpg'],
    '다이닝 룸': ['images/room-dining.jpg', 'images/room-dining-bath.jpg', 'images/room-dining-dishware.jpg'],
    '무비 다이닝': ['images/room-movie-dining.jpg', 'images/room-movie-dining-view.jpg', 'images/room-movie-dining-bed.jpg', 'images/room-movie-dining-kitchen.jpg'],
    '무비': ['images/room-movie.jpg', 'images/room-movie-view.jpg', 'images/room-movie-dining-bed.jpg', 'images/room-movie-dining-kitchen.jpg'],
    '플레이': ['images/room-play.jpg', 'images/room-play-view.jpg', 'images/room-movie-dining-bed.jpg', 'images/room-movie-dining-kitchen.jpg'],
    '키즈 룸': ['images/room-kids.jpg', 'images/room-kids-bed.jpg', 'images/room-kids-view.jpg', 'images/room-kids-bath.jpg'],
    '비즈니스': ['images/room-business.jpg', 'images/room-business-view.jpg', 'images/room-business-relax.jpg', 'images/room-business-kitchen.jpg'],
    '웰니스': ['images/room-wellness.jpg', 'images/room-wellness-view.jpg', 'images/room-wellness-bed.jpg', 'images/room-wellness-kitchen.jpg']
};

let roomsData = [];

async function fetchAndRenderRooms() {
    const roomsContainer = document.querySelector('.rooms-grid');
    if (!roomsContainer) return;

    if (typeof supabase === 'undefined' || !supabase) {
        console.error('Supabase not initialized');
        roomsContainer.innerHTML = '<p style="text-align:center; padding:2rem;">데이터를 불러올 수 없습니다.</p>';
        return;
    }

    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('price');

        if (error) throw error;

        // Merge DB data with local extended data
        roomsData = data.map(room => ({
            ...room,
            tags: roomTags[room.name] || [`기준 ${room.base_occupancy}인`, `최대 ${room.max_occupancy}인`],
            images: roomImages[room.name] || [room.image_url || 'images/default-room.jpg'],
            thumbnail: room.image_url || 'images/default-room.jpg'
        }));

        renderRooms();
    } catch (err) {
        console.error('Error fetching rooms:', err);
        roomsContainer.innerHTML = '<p style="text-align:center; padding:2rem;">객실 목록을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function renderRooms() {
    const roomsContainer = document.querySelector('.rooms-grid');
    if (!roomsContainer) return;

    roomsContainer.innerHTML = roomsData.map((room, index) => `
        <div class="room-card-grid scroll-reveal">
            <div class="room-thumb" 
                 style="background-image: url('${room.thumbnail}'); cursor: pointer;"
                 onclick="openRoomModal(${index})">
            </div>
            <div class="room-details">
                <h3>${room.name}</h3>
                <div class="room-tags">
                    ${room.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <p>${room.description || '편안한 휴식을 위한 객실입니다.'}</p>
                <div class="room-price">${room.price.toLocaleString()}원 ~</div>
                <button class="btn-primary" style="width:100%; margin-top:1rem;" onclick="openRoomModal(${index})">객실 상세보기</button>
            </div>
        </div>
    `).join('');

    // Re-trigger scroll reveal
    const newElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    newElements.forEach(el => revealObserver.observe(el));
}

// Modal Logic
let currentRoomIndex = 0;
let currentImageIndex = 0;

function openRoomModal(index) {
    currentRoomIndex = index;
    currentImageIndex = 0;
    const room = roomsData[index];

    if (!room) return;

    // Find modal
    let modal = document.getElementById('room-modal');
    // Ensure modal exists (index.html should have it)
    if (!modal) return;

    // Update Content
    // Note: IDs in index.html for modal might need to be checked if they match these exactly
    // Based on index.html reading: 'modal-room-name', 'modal-room-desc', 'modal-room-price', 'modal-room-tags'
    // 'modal-main-image', 'modal-sub-images'

    const nameEl = document.getElementById('modal-room-name');
    if (nameEl) nameEl.innerText = room.name;

    const descEl = document.getElementById('modal-room-desc');
    if (descEl) descEl.innerText = room.description || '';

    const priceEl = document.getElementById('modal-room-price');
    if (priceEl) priceEl.innerText = `${room.price.toLocaleString()}원 / 1박`;

    // Tags
    const tagsContainer = document.getElementById('modal-room-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = room.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    }

    // Main Image
    const mainImg = document.getElementById('modal-main-image');
    if (mainImg) mainImg.src = room.images[0];

    // Sub Images
    const subImagesContainer = document.getElementById('modal-sub-images');
    if (subImagesContainer) {
        subImagesContainer.innerHTML = room.images.map((img, idx) => `
            <img src="${img}" alt="${room.name}" 
                 onclick="changeModalImage(${idx})" 
                 class="${idx === 0 ? 'active' : ''}"
                 style="cursor: pointer;">
        `).join('');
    }

    // Book Button
    const bookBtn = document.getElementById('modal-book-btn');
    if (bookBtn) {
        bookBtn.onclick = () => {
            // Redirect to booking page with selected room details if needed, 
            // or just simple redirect as before
            window.location.href = `booking.html?room=${room.id}`; // Optional: pass room ID
        };
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeRoomModal() {
    const modal = document.getElementById('room-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function changeModalImage(imageIndex) {
    currentImageIndex = imageIndex;
    const room = roomsData[currentRoomIndex];

    const mainImg = document.getElementById('modal-main-image');
    if (mainImg) mainImg.src = room.images[imageIndex];

    const thumbnails = document.querySelectorAll('#modal-sub-images img');
    thumbnails.forEach((thumb, idx) => {
        if (idx === imageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // ... existing setup ...
    fetchAndRenderRooms(); // Fetch from DB instead of local render
    checkEventBanner();    // Check for Event Banner

    // Modal Event Listeners
    const modal = document.getElementById('room-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRoomModal();
        });
    }
});

async function checkEventBanner() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('site_config').select('*');
        if (error) return; // Silent fail if table missing

        const showBanner = data.find(c => c.key === 'event_banner_show')?.value === 'true';
        const bannerImg = data.find(c => c.key === 'event_banner_img')?.value;

        if (showBanner && bannerImg) {
            const banner = document.getElementById('event-banner');
            const img = document.getElementById('event-banner-img');
            if (banner && img) {
                img.src = bannerImg;
                banner.style.display = 'block';
            }
        }
    } catch (err) {
        console.log('Banner check failed:', err);
    }
}
async function handleLogout(e) {
    e.preventDefault();
    if (confirm('로그아웃 하시겠습니까?')) {
        const error = await signOut();
        if (error) alert('로그아웃 실패: ' + error.message);
        else window.location.reload();
    }
}

async function checkLoginStatusForBooking() {
    if (!supabase) {
        alert('예약 시스템 준비 중입니다.');
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // alert('예약 페이지로 이동합니다.');
        window.location.href = 'booking.html';
    } else {
        if (confirm('예약을 위해서는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
    }
}

// Slideshow Functions
let slideIndex = 0;
let slideTimer;

function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return; // No slideshow on this page

    showSlide(slideIndex);

    // Auto-play every 3 seconds
    slideTimer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 3000);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    // Wrap around
    if (n >= slides.length) { slideIndex = 0; }
    if (n < 0) { slideIndex = slides.length - 1; }

    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));

    // Remove active class from all dots
    dots.forEach(dot => dot.classList.remove('active'));

    // Show current slide
    slides[slideIndex].classList.add('active');

    // Highlight current dot
    if (dots[slideIndex]) {
        dots[slideIndex].classList.add('active');
    }
}

function changeSlide(n) {
    clearInterval(slideTimer); // Stop auto-play when user manually navigates
    slideIndex += n;
    showSlide(slideIndex);

    // Restart auto-play after 5 seconds
    slideTimer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 3000);
}

function currentSlide(n) {
    clearInterval(slideTimer); // Stop auto-play when user clicks a dot
    slideIndex = n - 1; // Dots are 1-indexed
    showSlide(slideIndex);

    // Restart auto-play after 5 seconds
    slideTimer = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 3000);
}

