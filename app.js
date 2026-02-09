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

// Room Data Management
const roomsData = [
    {
        id: 1,
        name: '스탠다드 더블',
        description: '모던한 분위기에 청결함으로 최적의 편안함을 제공하는 2인실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 2,
        price: 80000,
        tags: ['기준 2인', 'Queen Bed'],
        thumbnail: 'images/room-double.jpg',
        images: [
            'images/room-double.jpg',
            'images/room-double-bath.jpg'
        ]
    },
    {
        id: 2,
        name: '스탠다드 트윈',
        description: '기본 5성급 호텔 침구로 구성되어 있으며, 최대 3인까지 넉넉하게 쉴 수 있는 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 3,
        price: 100000,
        tags: ['기준 2인', '최대 3인(유료)', 'Queen + Single'],
        thumbnail: 'images/room-twin.jpg',
        images: [
            'images/room-twin.jpg',
            'images/room-double-bath.jpg',
            'images/room-twin-view.jpg'
        ]
    },
    {
        id: 3,
        name: '다이닝 룸',
        description: '식사를 위해 식탁과 의자가 마련된 분리된 다이닝 공간을 갖춘 특별한 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 150000,
        tags: ['기준 2인', '최대 4인(유료)', '2 Queen Beds', 'Dining Table'],
        thumbnail: 'images/room-dining.jpg',
        images: [
            'images/room-dining.jpg',
            'images/room-dining-bath.jpg',
            'images/room-dining-dishware.jpg'
        ]
    },
    {
        id: 4,
        name: '무비 다이닝',
        description: '맛있는 식사와 영화 감상을 동시에 즐길 수 있는 특별한 테마 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 160000,
        tags: ['기준 2인', '최대 4인(유료)', '다이닝+시네마', '대형스크린', '취사가능'],
        thumbnail: 'images/room-movie-dining.jpg',
        images: [
            'images/room-movie-dining.jpg',
            'images/room-movie-dining-view.jpg',
            'images/room-movie-dining-bed.jpg',
            'images/room-movie-dining-kitchen.jpg'
        ]
    },
    {
        id: 5,
        name: '무비',
        description: '프리미엄 사운드와 편안한 환경에서 영화와 드라마를 완벽하게 즐기는 시네마 전용 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 180000,
        tags: ['기준 2인', '최대 4인(유료)', '시네마', '사운드바', '취사가능'],
        thumbnail: 'images/room-movie.jpg',
        images: [
            'images/room-movie.jpg',
            'images/room-movie-view.jpg',
            'images/room-movie-dining-bed.jpg',
            'images/room-movie-dining-kitchen.jpg'
        ]
    },
    {
        id: 6,
        name: '플레이',
        description: '객실 안에서 즐거움을 만끽할 수 있도록 구성된 객실로 높은 만족도를 제공합니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 180000,
        tags: ['엔터테인먼트', '친구/커플', '취사가능'],
        thumbnail: 'images/room-play.jpg',
        images: [
            'images/room-play.jpg',
            'images/room-play-view.jpg',
            'images/room-movie-dining-bed.jpg',
            'images/room-movie-dining-kitchen.jpg'
        ]
    },
    {
        id: 7,
        name: '키즈 룸',
        description: '아이들의 안전과 재미를 고려한 공간 구성. 가족 여행에 최고의 만족을 제공합니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 200000,
        tags: ['기준 2인', '최대 4인(유료)', '가족여행', '아동친화', '취사가능'],
        thumbnail: 'images/room-kids.jpg',
        images: [
            'images/room-kids-bed.jpg',
            'images/room-kids-view.jpg',
            'images/room-kids-bath.jpg'
        ]
    },
    {
        id: 8,
        name: '비즈니스',
        description: '넉넉한 공간의 워크스테이션, Wi-Fi, 스마트 TV. 업무와 휴식의 전환이 자연스러운 비즈니스 최적화 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 200000,
        tags: ['기준 2인', '최대 4인(유료)', '출장/업무', 'Workstation', '취사가능'],
        thumbnail: 'images/room-business.jpg',
        images: [
            'images/room-business.jpg',
            'images/room-business-view.jpg',
            'images/room-business-relax.jpg',
            'images/room-business-kitchen.jpg'
        ]
    },
    {
        id: 9,
        name: '웰니스',
        description: '일상에서 벗어나 온전한 쉼을 원하는 고객을 위해 설계된 프리미엄 힐링 타입 객실입니다.',
        baseOccupancy: 2,
        maxOccupancy: 4,
        price: 220000,
        tags: ['기준 2인', '최대 4인(유료)', '힐링', '프리미엄', '취사가능'],
        thumbnail: 'images/room-wellness.jpg',
        images: [
            'images/room-wellness.jpg',
            'images/room-wellness-view.jpg',
            'images/room-wellness-bed.jpg',
            'images/room-wellness-kitchen.jpg'
        ]
    }
];

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
                <p>${room.description}</p>
                <div class="room-price">${room.price.toLocaleString()}원 ~</div>
                <button class="btn-primary" style="width:100%; margin-top:1rem;" onclick="openRoomModal(${index})">객실 상세보기</button>
            </div>
        </div>
    `).join('');

    // Re-trigger scroll reveal for new elements
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

    // Find or create modal
    let modal = document.getElementById('room-modal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    // Update Content
    document.getElementById('modal-room-name').innerText = room.name;
    document.getElementById('modal-room-desc').innerText = room.description;
    document.getElementById('modal-room-price').innerText = `${room.price.toLocaleString()}원 / 1박`;

    // Update tags
    const tagsContainer = document.getElementById('modal-room-tags');
    tagsContainer.innerHTML = room.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    // Update main image
    const mainImg = document.getElementById('modal-main-image');
    mainImg.src = room.images[0];

    // Update sub images (thumbnails)
    const subImagesContainer = document.getElementById('modal-sub-images');
    subImagesContainer.innerHTML = room.images.map((img, idx) => `
        <img src="${img}" alt="${room.name}" 
             onclick="changeModalImage(${idx})" 
             class="${idx === 0 ? 'active' : ''}"
             style="cursor: pointer;">
    `).join('');

    // Update book button to navigate to booking page
    const bookBtn = document.getElementById('modal-book-btn');
    bookBtn.onclick = () => {
        window.location.href = 'booking.html';
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeRoomModal() {
    const modal = document.getElementById('room-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function changeModalImage(imageIndex) {
    currentImageIndex = imageIndex;
    const room = roomsData[currentRoomIndex];

    // Update main image
    const mainImg = document.getElementById('modal-main-image');
    mainImg.src = room.images[imageIndex];

    // Update active state on thumbnails
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
    renderRooms(); // Call this

    // Modal Event Listeners
    const modal = document.getElementById('room-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRoomModal();
        });
    }
});
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
        alert('예약 페이지로 이동합니다. (준비 중)');
        // window.location.href = 'booking.html';
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

