import { Box, Typography } from '@mui/material';
import { useNavigate } from "react-router";

const category = [
    {
        image: 'https://assets-global.website-files.com/5d6322f018659f07ac06321a/6243a901867f82acb906b5a9_party-pom.jpg',
        name: 'Dog',
        emoji: '🐶',
        bg: '#f0edff',
        ring: '#c4b5fd',
    },
    {
        image: 'https://img.goodfon.com/wallpaper/big/9/a7/koshka-kot-temnyi-ochki-rubashka-zheltyi-fon.webp',
        name: 'Cat',
        emoji: '🐱',
        bg: '#ede9fe',
        ring: '#a78bfa',
    },
    {
        image: 'https://www.shutterstock.com/image-photo/blue-bird-ultramarine-flycatcher-superciliaris-600nw-508244377.jpg',
        name: 'Bird',
        emoji: '🐦',
        bg: '#e8f0ff',
        ring: '#93c5fd',
    },
    {
        image: 'https://w0.peakpx.com/wallpaper/2/622/HD-wallpaper-blue-discus-fish-fish-animals.jpg',
        name: 'Fish',
        emoji: '🐟',
        bg: '#e0f2fe',
        ring: '#7dd3fc',
    },
    {
        image: 'https://st.depositphotos.com/2364469/58366/i/450/depositphotos_583664168-stock-photo-cute-little-rabbit-green-grass.jpg',
        name: 'Little Pet',
        emoji: '🐰',
        bg: '#f3e8ff',
        ring: '#d8b4fe',
    },
    {
        image: 'https://www.thoughtco.com/thmb/KTKF0mDSAXCdLJQcAJq7QLSwBFw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-622013488-55a1fad50d93429fb927087e1f18cff8.jpg',
        name: 'Reptile',
        emoji: '🦎',
        bg: '#ecfdf5',
        ring: '#86efac',
    },
];

const Category = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                overflowX: 'auto',
                justifyContent: { xs: 'flex-start', md: 'center' },
                gap: { xs: 2.5, sm: 3, md: 4 },
                pt: '10px',
                pb: 1,
                px: { xs: 0.5, md: 0 },
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
            }}
        >
            {category.map((item, index) => (
                <Box
                    key={index}
                    onClick={() => navigate(`/category/${item.name}`)}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        minWidth: { xs: 72, md: 96 },
                        flexShrink: 0,
                        '&:hover .cat-circle': {
                            transform: 'translateY(-7px) scale(1.05)',
                            boxShadow: `0 12px 28px rgba(102, 126, 234, 0.28)`,
                        },
                        '&:hover .cat-label': {
                            color: '#667eea',
                        },
                    }}
                >
                    {/* Circle */}
                    <Box
                        className="cat-circle"
                        sx={{
                            width: { xs: 72, sm: 84, md: 96 },
                            height: { xs: 72, sm: 84, md: 96 },
                            borderRadius: '50%',
                            backgroundColor: item.bg,
                            border: `3px solid ${item.ring}`,
                            overflow: 'hidden',
                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 4px 14px rgba(102, 126, 234, 0.12)`,
                        }}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </Box>

                    {/* Label */}
                    <Typography
                        className="cat-label"
                        sx={{
                            mt: 1,
                            fontSize: { xs: '11px', sm: '12px', md: '13px' },
                            fontWeight: 700,
                            color: '#5a5a72',
                            fontFamily: "'Poppins', sans-serif",
                            transition: 'color 0.2s ease',
                            textAlign: 'center',
                            letterSpacing: '0.3px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {item.emoji} {item.name}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

export default Category;
