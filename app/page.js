'use client';
import { useState, useEffect, useRef } from 'react';
import { firestore } from '@/firebase';
import { Box, Button, Modal, Stack, Typography, TextField, IconButton } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from 'firebase/firestore';
import Webcam from 'react-webcam';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import * as React from 'react';
import { green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { Image } from 'mui-image'


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const webcamRef = useRef(null);

  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  }));



  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const classifyImage = async (imageSrc) => {
    // Simulate image classification
    // Replace this with an actual API call to GPT Vision or other LLM
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('classified-label');
      }, 1000);
    });
  };

  const captureAndClassifyImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const label = await classifyImage(imageSrc);
    await addItem(label, quantity, unit);
    setItemName(label);
    setOpenCamera(false);
  };

  const addItem = async (name, quantity, unit) => {
    const docRef = doc(collection(firestore, 'inventory'), name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + parseInt(quantity), unit });
    } else {
      await setDoc(docRef, { quantity: parseInt(quantity), unit });
    }

    await updateInventory();
  };

  const removeItem = async (name) => {
    const docRef = doc(collection(firestore, 'inventory'), name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      if (currentQuantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: currentQuantity - 1 });
      }
    }

    await updateInventory();
  };

  const handleSearch = () => {
    const filteredInventory = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setInventory(filteredInventory);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenSearch = () => setOpenSearch(true);
  const handleCloseSearch = () => setOpenSearch(false);
  const handleOpenCamera = () => setOpenCamera(true);
  const handleCloseCamera = () => setOpenCamera(false);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={3} sx={{ backgroundColor: '#003e29', minHeight: '100vh' }}>
      {/* <Box
  component="img"
  sx={{
    height: 233,
    width: 350,
    maxHeight: { xs: 233, md: 167 },
    maxWidth: { xs: 350, md: 250 },
  }}
  alt="Green cart logo."
  // src="https://imgur.com/gallery/green-cart-VYJN4JS"
  src="/app/resource/GreenCartLogo.jpg"
/> */}
<Image src="https://imgur.com/gallery/green-cart-VYJN4JS" />
      <Typography variant="h4" style={{ fontFamily: 'Poppins, sans-serif' }}  mb={2}>Inventory Management</Typography>
      <ColorButton variant="contained" onClick={handleOpenCamera} startIcon={<CameraAltIcon />} mt={3}>
        Capture and Classify Image
      </ColorButton>
      <Stack spacing={2} direction="row" mb={2} mt={3}>
        <TextField
          id="outlined-basic"
          label="Name"
          value={itemName}
          variant="outlined"
          color="success"
          onChange={(e) => setItemName(e.target.value)}
          focused
        />
        <TextField
          hiddenLabel
          id="outlined-basic"
          label="Quantity"
          value={quantity}
          variant="outlined"
          color="success"
          onChange={(e) => setQuantity(e.target.value)}
          focused
        />
        <TextField
          hiddenLabel
          id="outlined-basic"
          label="Unit"
          value={unit}
          variant="outlined"
          color="success"
          onChange={(e) => setUnit(e.target.value)}
          focused
        />
        <IconButton color="success" aria-label="add to inventory" onClick={() => {
          addItem(itemName, quantity, unit);
          setItemName('');
          setQuantity('');
          setUnit('');
        }}>
          <AddCircleOutlineIcon />
        </IconButton>
      </Stack>
      <IconButton color="success" aria-label="search inventory" onClick={handleOpenSearch}>
        <SearchIcon />
      </IconButton>
      <Modal open={openSearch} onClose={handleCloseSearch}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
        >
          <Typography variant="h6">Search Item</Typography>
          <TextField
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              handleSearch();
              handleCloseSearch();
            }}
          >
            Search
          </Button>
        </Box>
      </Modal>
      <Modal open={openCamera} onClose={handleCloseCamera}>
        <Box
          alignItems="center"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ borderRadius: '8px' }}
        >
          <Typography variant="h6">Capture Image</Typography>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
          />
          <ColorButton variant="contained" onClick={captureAndClassifyImage}>
            Capture and Classify Image
          </ColorButton>
        </Box>
      </Modal>
      <Box height="50px" width="800px" bgcolor="#467061" display="flex" alignItems="center" justifyContent="center" sx={{ borderRadius: '8px' }}>
        <Typography variant="h4" color="#333">
          Inventory items
        </Typography>
      </Box>
      <Box border="0.5px solid #333" width="800px" height="200px" mt={1} sx={{ borderRadius: '8px', overflow: 'auto' }}>
        <Stack width="100%" spacing={2}>
          {inventory.map(({ name, quantity, unit }) => (
            <Box key={name} width="100%" display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f0f0f0" padding={5}>
              <Typography variant="h6" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" color="#333" textAlign="center">
                {quantity} {unit}
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton color="success" aria-label="add to inventory" onClick={() => addItem(name, quantity, unit)}>
                  <AddCircleOutlineIcon />
                </IconButton>
                <IconButton color="success" aria-label="remove from inventory" onClick={() => removeItem(name)}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
    
  );
}
