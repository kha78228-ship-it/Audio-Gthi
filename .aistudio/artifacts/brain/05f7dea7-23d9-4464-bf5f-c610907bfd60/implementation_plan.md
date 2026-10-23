# Kế hoạch Triển khai: Hành trình Hướng dẫn Tương tác (Spotlight Onboarding Walkthrough) trên Haevy Portal

## 1. Tổng quan & Mục tiêu Trải nghiệm
Thiết kế và tích hợp hệ thống **Hướng dẫn Tương tác Từng bước (Interactive Spotlight Onboarding Walkthrough)** dành cho người dùng khi lần đầu mở **Haevy Portal**, đồng bộ hoàn toàn với ngôn ngữ thiết kế **Editorial Obsidian Atelier** (`#08090D` / `#10131A`, typography `Cormorant Garamond` + `Plus Jakarta Sans` + `JetBrains Mono`, viền mảnh `1px solid rgba(255,255,255,0.08)` và ánh sáng vàng hổ phách `#F59E0B`).

Hệ thống sử dụng cơ chế **Dynamic SVG/DOM Spotlight Cutout** tự động đo tọa độ thực tế (`getBoundingClientRect`) của từng vùng tính năng trên màn hình, làm tối hậu cảnh xung quanh và mở khóa vùng tương tác để người dùng có thể **thử nghiệm trực tiếp tính năng ngay trong bước hướng dẫn**.

---

## 2. Cấu trúc 5 Bước Hướng dẫn Tương tác (Spotlight Tour Steps)

1. **Bước 01 — Chân dung Sống động 3D (Living Portrait Stage)**
   - **Vùng chiếu sáng (`data-onboarding="living-portrait"`)**: Sân khấu chân dung nghệ thuật 3D và bộ nút chuyển đổi 3 bối cảnh trên Hero của Haevy Portal.
   - **Trải nghiệm thử trực tiếp**: Người dùng di chuột để cảm nhận hiệu ứng nghiêng 3D (Parallax Chiaroscuro) và bấm chuyển thử giữa 3 chân dung (*Lâm Vũ Minh Anh*, *TS. Trần Hoàng Bách*, *Gia đình An Nhiên*) hoặc bật nghe thử sóng âm trực tiếp.

2. **Bước 02 — Điều khiển Giọng nói Thông minh (Voice Navigation HUD)**
   - **Vùng chiếu sáng (`data-onboarding="voice-navigation"`)**: Cụm nút Micro Điều khiển Giọng nói trên thanh tiêu đề Portal và bảng HUD Giọng nói (`HaevyVoiceNavigationHUD`).
   - **Trải nghiệm thử trực tiếp**: Cung cấp nút **"Thử câu lệnh giọng nói mẫu"** ngay trên thẻ hướng dẫn (ví dụ: *"Phát nhạc thư giãn"*, *"Mở bàn học Edu"*) để kích hoạt mô phỏng nhận diện giọng nói mà không làm thoát khỏi luồng hướng dẫn.

3. **Bước 03 — Floating Dock & Thanh Điều hướng Nhanh Toàn cục (`Alt + M`)**
   - **Vùng chiếu sáng (`data-onboarding="floating-dock"`)**: Thanh điều hướng nổi thông minh / Nút mở Bảng chuyển đổi nhanh hệ sinh thái và thanh công cụ dưới cùng.
   - **Trải nghiệm thử trực tiếp**: Cho phép người dùng bấm xem trước **Floating Dock thu gọn/mở rộng** và bảng chuyển đổi nhanh (`Quick Switcher`) chỉ với 1 chạm hoặc phím tắt `Alt + M`.

4. **Bước 04 — Kiến trúc Lưới 12 Phân hệ (Asymmetric Bento Grid)**
   - **Vùng chiếu sáng (`data-onboarding="ecosystem-bento"`)**: Khu vực bộ lọc danh mục (*Trọng tâm*, *Đời sống & Gia đình*, *Sáng tạo & Giải trí*) và các thẻ phân hệ Bento tương tác.
   - **Trải nghiệm thử trực tiếp**: Người dùng bấm lọc thử các nhóm phân hệ hoặc mở modal **Xem chi tiết tính năng** của bất kỳ phân hệ nào ngay trong vùng Spotlight.

5. **Bước 05 — Trợ lý AI Nổi & Sổ tay Ghi chú Nhanh (Floating AI & Quick Note)**
   - **Vùng chiếu sáng (`data-onboarding="floating-widgets"`)**: Cụm công cụ nổi ở góc dưới màn hình gồm `HaevyAIFloatingWidget` (Trợ lý Phân tích Tài liệu) và `FloatingQuickNoteWidget` (Ghi chú nhanh toàn cục).
   - **Trải nghiệm thử trực tiếp**: Khám phá cách ghi chú tức thì hoặc gọi trợ lý phân tích ở bất kỳ phân hệ nào, sau đó bấm **"Hoàn tất & Nhận thưởng"** để kết thúc hành trình.

---

## 3. Cơ chế Kích hoạt, Lưu trữ & Phần thưởng Hoàn thành

- **Tự động mở lần đầu tiên**:
  - Kiểm tra khóa `haevy_portal_onboarding_v1_completed` trong `localStorage` (kết hợp đồng bộ theo `user?.uid` nếu đã đăng nhập).
  - Nếu người dùng mới chưa hoàn thành (hoặc chưa từng bấm bỏ qua), hệ thống tự động khởi chạy bước chào mừng sau `800ms` khi Haevy Portal tải xong.
- **Nút "Hướng dẫn" (Xem lại bất kỳ lúc nào)**:
  - Bổ sung nút biểu tượng **La bàn / Hướng dẫn (`Compass` / `Sparkles`)** tinh tế trên thanh Header của `HaevyEcosystemLandingView` kèm chú thích *"Hướng dẫn khám phá Portal"*, cho phép người dùng mở lại chuyến tham quan bất cứ lúc nào.
- **Phần thưởng Hoàn thành Lần đầu**:
  - Khi hoàn tất bước 5 lần đầu tiên (kiểm tra khóa `haevy_portal_onboarding_reward_claimed`), hệ thống trao tặng gói quà khởi đầu thông qua `AuthContext`:
    - **+200 Điểm Thính Giác (`addAudioPoints`)**
    - **+50 Lite Coin (`earnHaevyLiteCoins`)**
  - Hiển thị thẻ chúc mừng trang trọng theo phong cách *Editorial Obsidian Atelier* kèm hiệu ứng âm thanh phản hồi tinh tế (`luxurySoundFX`).

---

## 4. Kiến trúc Tệp tin & Thay đổi Dự kiến

- **`src/components/portal/HaevyPortalOnboardingTour.tsx` (Tạo mới)**:
  - Component điều phối toàn bộ trải nghiệm Spotlight Onboarding:
    - Lớp phủ SVG Spotlight (`mask` bo góc mượt mà theo `getBoundingClientRect` và tự động cuộn mượt `scrollIntoView` tới phần tử mục tiêu).
    - Thẻ thuyết minh nổi (*Atelier Guided Popover*) hiển thị số thứ tự bước (`01 / 05`), tiêu đề `Cormorant Garamond`, mô tả ngắn gọn, nút **"Tương tác thử ngay"**, thanh tiến độ, nút **Quay lại / Tiếp theo / Bỏ qua** và hỗ trợ điều hướng bằng phím mũi tên (`←` / `→` / `Esc`).
    - Màn hình tổng kết trao thưởng hoàn thành hướng dẫn.
- **`src/components/HaevyEcosystemLandingView.tsx` (Cập nhật)**:
  - Gắn các thuộc tính định danh `data-onboarding="..."` vào đúng các khu vực: Thanh điều hướng nhanh / Floating Dock trigger, Nút Voice Navigation, Sân khấu `LivingPortraitShowcase`, và Lưới `Asymmetric Bento 12 Phân hệ`.
  - Bổ sung nút **"Hướng dẫn"** trên thanh Header của Portal để người dùng kích hoạt lại bất kỳ lúc nào.
- **`src/App.tsx` (Cập nhật)**:
  - Gắn thuộc tính `data-onboarding` cho cụm Floating Dock / Quick Switcher và Floating AI + Quick Note Widgets.
  - Tích hợp `HaevyPortalOnboardingTour` khi `currentMode === 'portal'` và kết nối với `simulateVoiceCommand`, `toggleVoiceListening`, cùng `useAuth()` để cộng thưởng khi hoàn tất.
