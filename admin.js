// Admin.js
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadRooms(); // Default

    // Form Submit Handler
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateRoom();
    });
});

async function checkAdminAuth() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();

    const ADMIN_EMAILS = ['dimplekiller@daum.net', 'sokchovac@naver.com'];

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
        alert('관리자 권한이 없습니다.');
        window.location.replace('index.html');
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// --- Tab Navigation ---
function showTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Load Data based on Tab
    if (tabName === 'users') loadUsers();
    if (tabName === 'bookings') loadBookings();
    if (tabName === 'settings') loadBannerSettings();
}

// --- Rooms Management ---
let adminRoomsData = [];
async function loadRooms() {
    const tableBody = document.getElementById('room-list-body');
    tableBody.innerHTML = '<tr><td colspan="4">로딩 중...</td></tr>';

    try {
        const { data: rooms, error } = await supabase.from('rooms').select('*').order('price');
        if (error) throw error;

        adminRoomsData = rooms;
        tableBody.innerHTML = rooms.map(room => `
            <tr>
                <td><strong>${room.name}</strong></td>
                <td>￦${room.price.toLocaleString()}</td>
                <td>${room.base_occupancy} / ${room.max_occupancy}명</td>
                <td>
                    <button class="btn btn-primary" onclick="openEditModal('${room.id}')">수정</button>
                    <button class="btn" style="background:#2ecc71; color:white;" onclick="openImageModal('${room.id}')">이미지</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = '<tr><td colspan="4">데이터 로딩 실패</td></tr>';
    }
}

function openEditModal(roomId) {
    const room = adminRoomsData.find(r => r.id == roomId);
    if (!room) return;

    document.getElementById('edit-id').value = room.id;
    document.getElementById('edit-name').value = room.name;
    document.getElementById('edit-price').value = room.price;
    document.getElementById('edit-desc').value = room.description || '';

    document.getElementById('edit-modal').style.display = 'flex';
}

// --- Room Image Upload Logic ---
let selectedRoomFiles = [];

function handleRoomFileSelect(e) {
    const files = Array.from(e.target.files);
    addFilesToPreview(files);
}

function addFilesToPreview(files) {
    selectedRoomFiles = [...selectedRoomFiles, ...files];
    const previewArea = document.getElementById('room-preview-area');

    // Clear and Redraw
    previewArea.innerHTML = '';
    selectedRoomFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.border = '1px solid #ddd';
            img.title = file.name;
            previewArea.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Drag & Drop for Rooms
const roomDropZone = document.getElementById('room-drop-zone');
if (roomDropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        roomDropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    roomDropZone.addEventListener('dragover', () => roomDropZone.style.background = '#e8f0fe');
    roomDropZone.addEventListener('dragleave', () => roomDropZone.style.background = '#fafafa');

    roomDropZone.addEventListener('drop', (e) => {
        roomDropZone.style.background = '#fafafa';
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            addFilesToPreview(files);
        }
    });
}

async function saveRoomImages(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-room-imgs');
    const originalText = btn.innerText;
    btn.innerText = '업로드 및 저장 중...';
    btn.disabled = true;

    const roomId = document.getElementById('img-room-id').value;
    let currentUrls = document.getElementById('img-urls').value.split('\n').map(u => u.trim()).filter(u => u.length > 0);

    try {
        // 1. Upload New Files
        if (selectedRoomFiles.length > 0) {
            for (const file of selectedRoomFiles) {
                const publicUrl = await uploadRoomFile(file);
                currentUrls.push(publicUrl);
            }
        }

        // 2. Save to DB
        const { error } = await supabase.from('rooms')
            .update({ images: currentUrls }) // images column is jsonb array
            .eq('id', roomId);

        if (error) throw error;

        alert('이미지가 저장되었습니다.');
        closeModal('image-modal');
        loadRooms();

        // Reset
        selectedRoomFiles = [];
        document.getElementById('room-preview-area').innerHTML = '';

    } catch (err) {
        alert('저장 실패: ' + err.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

async function uploadRoomFile(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from('room_images')
        .upload(filePath, file);

    if (error) throw new Error(`업로드 실패 (${file.name}): ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from('room_images')
        .getPublicUrl(filePath);

    return publicUrl;
}

// Reset selected files when opening modal
function openImageModal(roomId) {
    const room = adminRoomsData.find(r => r.id == roomId);
    if (!room) return;

    document.getElementById('img-room-id').value = room.id;
    selectedRoomFiles = []; // Reset
    document.getElementById('room-preview-area').innerHTML = ''; // Reset

    const images = room.images || [];
    const urls = Array.isArray(images) ? images : [];

    document.getElementById('img-urls').value = urls.join('\n');
    document.getElementById('image-modal').style.display = 'flex';
}

async function updateRoom() {
    const id = document.getElementById('edit-id').value;
    const price = document.getElementById('edit-price').value;
    const description = document.getElementById('edit-desc').value;

    try {
        const { error } = await supabase.from('rooms')
            .update({ price: parseInt(price), description: description })
            .eq('id', id);

        if (error) throw error;
        alert('수정되었습니다.');
        closeModal('edit-modal');
        loadRooms();
    } catch (err) {
        alert('수정 실패: ' + err.message);
    }
}

// --- Users Management ---
async function loadUsers() {
    const tableBody = document.getElementById('user-list-body');
    tableBody.innerHTML = '<tr><td colspan="4">로딩 중...</td></tr>';

    try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01') {
                tableBody.innerHTML = '<tr><td colspan="4" style="color:red">SQL 업데이트 필요 (admin_update.sql 실행)</td></tr>';
                return;
            }
            throw error;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">가입된 회원이 없습니다.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(user => `
            <tr>
                <td>${user.full_name || '이름 없음'}</td>
                <td>${user.email}</td>
                <td>
                    <select onchange="updateUserGrade('${user.id}', this.value)" style="padding:4px;">
                        <option value="Bronze" ${user.grade === 'Bronze' ? 'selected' : ''}>Bronze</option>
                        <option value="Silver" ${!user.grade || user.grade === 'Silver' ? 'selected' : ''}>Silver</option>
                        <option value="Gold" ${user.grade === 'Gold' ? 'selected' : ''}>Gold</option>
                        <option value="VIP" ${user.grade === 'VIP' ? 'selected' : ''}>VIP</option>
                    </select>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="4">데이터 로딩 실패: ${err.message}</td></tr>`;
    }
}

async function updateUserGrade(userId, newGrade) {
    try {
        const { error } = await supabase.from('profiles').update({ grade: newGrade }).eq('id', userId);
        if (error) throw error;
        // Optional: show toast/notification
        console.log('Grade updated');
    } catch (err) {
        alert('등급 수정 실패: ' + err.message);
        loadUsers(); // Revert UI
    }
}

// --- Bookings Management ---
async function loadBookings() {
    const tableBody = document.getElementById('booking-list-body');
    tableBody.innerHTML = '<tr><td colspan="6">로딩 중...</td></tr>';

    try {
        // Fetch bookings and profiles separately to avoid Foreign Key issues
        const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*, rooms(name)')
            .order('created_at', { ascending: false });

        if (bookingError) {
            if (bookingError.code === '42P01') {
                tableBody.innerHTML = '<tr><td colspan="6" style="color:red">SQL 스크립트를 실행해주세요 (bookings 테이블 없음)</td></tr>';
                return;
            }
            throw bookingError;
        }

        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">예약 내역이 없습니다.</td></tr>';
            return;
        }

        // Fetch profiles to map names
        const userIds = bookings.map(b => b.user_id);
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        // Create a map for quick lookup
        const profileMap = {};
        if (profiles) {
            profiles.forEach(p => profileMap[p.id] = p.full_name);
        }

        tableBody.innerHTML = bookings.map(booking => {
            const guestName = profileMap[booking.user_id] || '알 수 없음';
            const roomName = booking.rooms?.name || '객실 정보 없음';

            return `
            <tr>
                <td>${booking.id}</td>
                <td>${guestName}</td>
                <td>${roomName}</td>
                <td>${booking.check_in} ~ ${booking.check_out}</td>
                <td><span class="badge ${booking.status}">${booking.status}</span></td>
                <td>
                    ${booking.status !== 'cancelled' ?
                    `<button class="btn" style="background:#e74c3c; color:white; font-size:0.8rem; padding:4px 8px;" onclick="cancelBooking('${booking.id}')">취소</button>`
                    : '-'}
                </td>
            </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="6">데이터 로딩 실패: ${err.message}</td></tr>`;
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('정말 이 예약을 취소하시겠습니까?')) return;

    try {
        const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
        if (error) throw error;
        alert('예약이 취소되었습니다.');
        loadBookings();
    } catch (err) {
        alert('취소 실패: ' + err.message);
    }
}

// --- Settings (Event Banner) ---
async function loadBannerSettings() {
    try {
        const { data, error } = await supabase.from('site_config').select('*');
        if (error) throw error; // Will fail if table doesn't exist

        const activeConfig = data.find(c => c.key === 'event_banner_show');
        const imgConfig = data.find(c => c.key === 'event_banner_img');

        if (activeConfig) {
            document.getElementById('banner-active').checked = (activeConfig.value === 'true');
        }
        if (imgConfig) {
            document.getElementById('banner-url').value = imgConfig.value || '';
        }

    } catch (err) {
        console.log('Settings load error (likely table missing):', err.message);
    }
}

async function saveBannerSettings(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = '저장 중...';
    saveBtn.disabled = true;

    try {
        const isActive = document.getElementById('banner-active').checked;
        let imgUrl = document.getElementById('banner-url').value;
        const fileInput = document.getElementById('banner-file');

        // 1. Upload File if selected
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            imgUrl = await uploadBannerImage(file);
        }

        // 2. Save Config to DB
        const { error: err1 } = await supabase.from('site_config').upsert({
            key: 'event_banner_show',
            value: isActive.toString()
        });

        const { error: err2 } = await supabase.from('site_config').upsert({
            key: 'event_banner_img',
            value: imgUrl
        });

        if (err1 || err2) throw new Error('DB 저장 실패');

        alert('설정이 저장되었습니다.');

    } catch (err) {
        alert('실패: ' + err.message + '\n(스토리지 설정 SQL을 실행했는지 확인해주세요)');
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
        loadBannerSettings(); // Refresh
    }
}

// --- File Upload Logic ---
async function uploadBannerImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `banner_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to 'banners' bucket
    const { data, error } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

    if (error) {
        throw new Error('이미지 업로드 실패: ' + error.message);
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

    return publicUrl;
}

// Drag & Drop Handlers
const dropZone = document.getElementById('drop-zone');
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropZone.addEventListener('dragover', () => dropZone.style.background = '#e8f0fe');
    dropZone.addEventListener('dragleave', () => dropZone.style.background = '#fafafa');

    dropZone.addEventListener('drop', (e) => {
        dropZone.style.background = '#fafafa';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('banner-file').files = files;
            handleFileSelect({ target: { files: files } });
        }
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('banner-preview');
            const previewArea = document.getElementById('preview-area');
            const fileName = document.getElementById('file-name');

            preview.src = e.target.result;
            previewArea.style.display = 'block';
            fileName.innerText = file.name;
        };
        reader.readAsDataURL(file);
    }
}

// Utility
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
