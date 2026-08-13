export type CameraOption = {
  key: string;
  en: string;
  vi: string;
  desc: string;
};

export const CAMERA_ANGLES: CameraOption[] = [
  { key: "eye-level", en: "Eye Level", vi: "Ngang tầm mắt", desc: "Máy quay đặt ngang tầm mắt nhân vật, tạo cảm giác tự nhiên, trung lập." },
  { key: "high-angle", en: "High Angle", vi: "Góc cao", desc: "Máy quay đặt cao hướng xuống, khiến chủ thể trông nhỏ bé, yếu thế." },
  { key: "low-angle", en: "Low Angle", vi: "Góc thấp", desc: "Máy quay đặt thấp hướng lên, khiến chủ thể trông to lớn, quyền lực." },
  { key: "birds-eye", en: "Bird's Eye View", vi: "Góc từ trên xuống (mắt chim)", desc: "Quay thẳng đứng từ trên cao xuống, cho thấy toàn cảnh bố cục không gian." },
  { key: "dutch-angle", en: "Dutch Angle", vi: "Góc nghiêng", desc: "Máy quay nghiêng trục ngang, tạo cảm giác bất ổn, căng thẳng." },
  { key: "ots", en: "Over The Shoulder", vi: "Qua vai", desc: "Quay qua vai một nhân vật hướng về nhân vật đối diện, dùng trong đối thoại." },
  { key: "close-up", en: "Close Up", vi: "Cận cảnh", desc: "Khung hình sát mặt/chi tiết nhỏ, nhấn mạnh cảm xúc hoặc chi tiết quan trọng." },
  { key: "wide-shot", en: "Wide Shot", vi: "Toàn cảnh rộng", desc: "Khung hình rộng bao trọn nhân vật và bối cảnh xung quanh." },
  { key: "long-shot", en: "Long Shot", vi: "Toàn thân xa", desc: "Chủ thể được quay từ xa, thấy toàn thân trong bối cảnh." },
  { key: "pov", en: "POV Shot", vi: "Góc nhìn nhân vật", desc: "Khung hình mô phỏng đúng góc nhìn của một nhân vật trong cảnh." },
  { key: "top-down", en: "Top Down", vi: "Từ trên thẳng xuống", desc: "Máy quay thẳng đứng 90 độ nhìn xuống chủ thể, thường dùng cho hành động trên mặt phẳng." },
  { key: "side-angle", en: "Side Angle", vi: "Góc nghiêng bên", desc: "Quay từ một bên hông của chủ thể, thể hiện đường nét profile." },
  { key: "back-view", en: "Back View", vi: "Từ phía sau", desc: "Quay từ phía sau lưng chủ thể, tạo cảm giác bí ẩn, dõi theo." },
  { key: "framed-shot", en: "Framed Shot", vi: "Khung trong khung", desc: "Chủ thể được đóng khung bởi vật thể khác trong cảnh (cửa, cửa sổ...)." },
  { key: "symmetrical", en: "Symmetrical Shot", vi: "Đối xứng", desc: "Bố cục cân đối hai bên trục giữa khung hình, tạo cảm giác trang trọng." },
  { key: "tilt-up", en: "Tilt Up", vi: "Hất máy lên", desc: "Máy quay tĩnh xoay trục dọc từ thấp lên cao." },
  { key: "tilt-down", en: "Tilt Down", vi: "Hạ máy xuống", desc: "Máy quay tĩnh xoay trục dọc từ cao xuống thấp." },
  { key: "ots-close", en: "OTS Close", vi: "Qua vai cận", desc: "Qua vai nhưng khung hẹp hơn, nhấn vào biểu cảm nhân vật đối diện." },
  { key: "leading-lines", en: "Leading Lines", vi: "Đường dẫn hướng", desc: "Sử dụng đường nét trong bối cảnh (đường, hành lang...) dẫn mắt người xem vào chủ thể." },
  { key: "extreme-low", en: "Extreme Low Angle", vi: "Góc cực thấp", desc: "Máy quay đặt sát mặt đất hướng lên, phóng đại sự áp đảo/uy quyền của chủ thể." },
];

export const CAMERA_MOVEMENTS: CameraOption[] = [
  { key: "static", en: "Static", vi: "Tĩnh", desc: "Máy quay đứng yên hoàn toàn trong suốt shot." },
  { key: "pan", en: "Pan", vi: "Lia ngang/dọc", desc: "Máy quay xoay tại chỗ theo phương ngang hoặc dọc, không di chuyển vị trí." },
  { key: "dolly", en: "Dolly/Track", vi: "Đẩy/kéo máy", desc: "Máy quay di chuyển tiến/lùi hoặc trượt ngang trên ray hoặc xe đẩy." },
  { key: "zoom", en: "Zoom", vi: "Zoom ống kính", desc: "Thay đổi tiêu cự ống kính để phóng to/thu nhỏ khung hình, máy không di chuyển." },
  { key: "handheld", en: "Handheld", vi: "Cầm tay", desc: "Quay cầm tay tạo độ rung tự nhiên, cảm giác chân thực, gần gũi." },
  { key: "slow-motion", en: "Slow Motion", vi: "Quay chậm", desc: "Quay tốc độ khung hình cao để phát lại chậm, nhấn mạnh khoảnh khắc." },
];
