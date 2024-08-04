'use client'
import { useState, useEffect, useRef } from 'react'
import { firestore } from '@/firebase'
import { Box, Button, Modal, Stack, Typography, TextField } from '@mui/material'
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from 'firebase/firestore'
import Webcam from 'react-webcam'
// import { signOut, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import '../app/globals.css'

export default function Home() {
  // const session = useSession({
  //   required: true,
  //   onUnauthenticated() {
  //     redirect('/signin')
  //   }
  // })

  const [inventory, setInventory] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [openCamera, setOpenCamera] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const webcamRef = useRef(null)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const classifyImage = async (imageSrc) => {
    // Simulate image classification
    // Replace this with an actual API call to GPT Vision or other LLM
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('classified-label')
      }, 1000)
    })
  }

  const captureAndClassifyImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot()
    const label = await classifyImage(imageSrc)
    await addItem(label, quantity, unit)
    setItemName(label)
    setOpenCamera(false)
  }

  const addItem = async (name, quantity, unit) => {
    const docRef = doc(collection(firestore, 'inventory'), name)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: currentQuantity + parseInt(quantity), unit })
    } else {
      await setDoc(docRef, { quantity: parseInt(quantity), unit })
    }

    await updateInventory()
  }

  const removeItem = async (name) => {
    const docRef = doc(collection(firestore, 'inventory'), name)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data()
      if (currentQuantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: currentQuantity - 1 })
      }
    }

    await updateInventory()
  }

  const handleSearch = () => {
    const filteredInventory = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setInventory(filteredInventory)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => setOpenAdd(false)
  const handleOpenSearch = () => setOpenSearch(true)
  const handleCloseSearch = () => setOpenSearch(false)
  const handleOpenCamera = () => setOpenCamera(true)
  const handleCloseCamera = () => setOpenCamera(false)

  return (
    <>
      {/* <div className="p-8">
        <div className='text-white'>{session?.data?.user?.email}</div>
        <button className='text-white' onClick={() => signOut()}>Logout</button>
      </div> */}

      <Box display="flex" flexDirection="column" alignItems="center" mt={3} sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <Typography variant="h1" mb={2}>Inventory Management</Typography>
        <Button variant="contained" onClick={handleOpenCamera} mt={3}>
          Capture and Classify Image
        </Button>
        <Stack spacing={2} direction="row" mb={2} mt={3}>
          <TextField
            variant="outlined"
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <TextField
            variant="outlined"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <TextField
            variant="outlined"
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => {
              addItem(itemName, quantity, unit)
              setItemName('')
              setQuantity('')
              setUnit('')
            }}
          >
            Add Item
          </Button>
        </Stack>
        <Button
          variant="contained"
          onClick={handleOpenSearch}
        >
          Search
        </Button>
        <Modal open={openAdd} onClose={handleCloseAdd}>
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
            gap={3}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                variant="outlined"
                fullWidth
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <TextField
                variant="outlined"
                fullWidth
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName, quantity, unit)
                  setItemName('')
                  setQuantity('')
                  setUnit('')
                  handleCloseAdd()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
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
                handleSearch()
                handleCloseSearch()
              }}
            >
              Search
            </Button>
          </Box>
        </Modal>
        <Modal open={openCamera} onClose={handleCloseCamera}>
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
            gap={3}
          >
            <Typography variant="h6">Capture Image</Typography>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
            />
            <Button variant="contained" onClick={captureAndClassifyImage}>
              Capture and Classify Image
            </Button>
          </Box>
        </Modal>
        <Box border="1px solid #333" width="800px" mt={2}>
          <Box height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h2" color="#333">
              Inventory items
            </Typography>
          </Box>
          <Stack width="100%" height="300px" spacing={2} overflow="auto">
            {inventory.map(({ name, quantity, unit }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f0f0f0" padding={5}>
                <Typography variant="h3" color="#333" textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign="center">
                  {quantity} {unit}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" sx={{ backgroundColor: '#6B5F4e' }} onClick={() => addItem(name, quantity, unit)}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  )
}
