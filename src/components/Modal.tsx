import CancelIcon from "@mui/icons-material/Cancel";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
function CustomModal({
  backgroundColor,
  isOpen,
  handleClose,
  children,
}: {
  backgroundColor?: string;
  isOpen: boolean;
  handleClose: () => void;
  children: React.ReactNode;
}) {
  const style = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: "80%", md: 400 },
    maxWidth: "95vw",
    maxHeight: { xs: "90vh", md: "95vh" },
    bgcolor: backgroundColor ? backgroundColor : "white",
    boxShadow: 24,
    borderRadius: 5,
    p: 1,
    overflow: "hidden",
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={style}>
        <CancelIcon onClick={handleClose} className="hover:cursor-pointer" />
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            overflowY: "auto",
            maxHeight: { xs: "calc(90vh - 60px)", md: "calc(95vh - 60px)" }
          }} 
          className="w-full flex flex-col gap-y-4"
        >
          {children}
        </Box>
      </Box>
    </Modal>
  );
}

export default CustomModal;
