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

function openImageModal(roomId) {
    const room = adminRoomsData.find(r => r.id == roomId);
    if (!room) return;

    document.getElementById('img-room-id').value = room.id;

    // Join images with newline
    const images = room.images || [];
    // If images is a JSON string (unlikely if typed as jsonb but just in case), parse it
    // Supabase returns JSONB as object/array automatically in JS
    const urls = Array.isArray(images) ? images : [];

    document.getElementById('img-urls').value = urls.join('\n');
    document.getElementById('image-modal').style.display = 'flex';
}

async function saveRoomImages(e) {
    e.preventDefault();
    const roomId = document.getElementById('img-room-id').value;
    const text = document.getElementById('img-urls').value;

    // Split by newline and filter empty
    const images = text.split('\n').map(url => url.trim()).filter(url => url.length > 0);

    try {
        const { error } = await supabase.from('rooms')
            .update({ images: images }) // images column is jsonb
            .eq('id', roomId);

        if (error) throw error;

        alert('이미지가 저장되었습니다.');
        closeModal('image-modal');
        loadRooms(); // Reload to refresh data
    } catch (err) {
        alert('저장 실패: ' + err.message);
    }
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
        // Mock data or real fetch if table exists
        const { data, error } = await supabase.from('bookings').select('*, profiles(full_name), rooms(name)').order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01') {
                tableBody.innerHTML = '<tr><td colspan="6" style="color:red">SQL 스크립트를 실행해주세요 (bookings 테이블 없음)</td></tr>';
                return;
            }
            throw error;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">예약 내역이 없습니다.</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(booking => `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.profiles?.full_name || '알 수 없음'}</td>
                <td>${booking.rooms?.name || '객실'}</td>
                <td>${booking.check_in} ~ ${booking.check_out}</td>
                <td><span class="badge ${booking.status}">${booking.status}</span></td>
                <td>
                    ${booking.status !== 'cancelled' ?
                `<button class="btn" style="background:#e74c3c; color:white; font-size:0.8rem; padding:4px 8px;" onclick="cancelBooking('${booking.id}')">취소</button>`
                : '-'}
                </td>
            </tr>
        `).join('');

    } catch (err) {
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
    const isActive = document.getElementById('banner-active').checked;
    const imgUrl = document.getElementById('banner-url').value;

    try {
        // Upsert 1
        const { error: err1 } = await supabase.from('site_config').upsert({
            key: 'event_banner_show',
            value: isActive.toString()
        });

        // Upsert 2
        const { error: err2 } = await supabase.from('site_config').upsert({
            key: 'event_banner_img',
            value: imgUrl
        });

        if (err1 || err2) throw new Error('DB Update Failed');

        alert('설정이 저장되었습니다.');
    } catch (err) {
        alert('저장 실패: ' + err.message + '\n(SQL 스크립트를 실행했는지 확인해주세요)');
    }
}

// Utility
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
