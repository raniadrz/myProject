import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle, 
    IconButton, 
    Avatar, 
    TextField, 
    InputAdornment, 
    Chip,
    Box,
    Paper,
    Typography,
    Card,
    CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useContext, useState } from 'react';
import MyContext from "../../../context/myContext";
import UserCreationForm from '../UserCreationForm'; // Import your existing form component
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import toast from 'react-hot-toast';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Popover from '@mui/material/Popover';

const UserDetail = () => {
    const context = useContext(MyContext);
    const { getAllUser, updateUserRole, deleteUser } = context;

    // Add this debug log
    console.log('Raw getAllUser data:', getAllUser);

    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false); // State for create user dialog
    const [selectedUser, setSelectedUser] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [filters, setFilters] = useState({
        role: 'all',
        dateJoined: 'all',
        lastActive: 'all'
    });

    const [page, setPage] = useState(1);
    const usersPerPage = 10;

    const filteredUsers = Array.isArray(getAllUser) ? getAllUser.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.role?.toLowerCase().includes(searchLower);

        // Role filter
        const matchesRole = filters.role === 'all' || user.role === filters.role;

        // Date joined filter
        let matchesDateJoined = true;
        if (filters.dateJoined !== 'all') {
            const userDate = new Date(user.date);
            const today = new Date();
            const diffDays = Math.floor((today - userDate) / (1000 * 60 * 60 * 24));

            switch (filters.dateJoined) {
                case 'last7days':
                    matchesDateJoined = diffDays <= 7;
                    break;
                case 'last30days':
                    matchesDateJoined = diffDays <= 30;
                    break;
                case 'last90days':
                    matchesDateJoined = diffDays <= 90;
                    break;
            }
        }

        return matchesSearch && matchesRole && matchesDateJoined;
    }) : [];

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, filteredUsers.length);
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Add this console log to debug pagination
    console.log({
        totalUsers: filteredUsers.length,
        startIndex,
        endIndex,
        currentUsers: currentUsers.length,
        page,
        totalPages
    });

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const rows = currentUsers.map((user, index) => ({
        id: startIndex + index + 1, // This keeps the numbering continuous across pages
        name: user.name,
        email: user.email,
        date: user.date,
        role: user.role,
        uid: user.id,
        photoURL: user.photoURL,
        lastActive: user.lastActive
    }));

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleClickOpenRoleDialog = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role); // Set initial role
        setOpenRoleDialog(true);
    };

    const handleCloseRoleDialog = () => {
        setOpenRoleDialog(false);
        setSelectedUser(null);
        setSelectedRole(''); // Reset selected role
    };

    const [selectedRole, setSelectedRole] = useState('');

    const handleConfirmRoleChange = async () => {
        if (!selectedUser || !selectedRole) {
            toast.error('Please select a role');
            return;
        }

        try {
            await updateUserRole(selectedUser.uid, selectedRole); // Pass the new selected role
            handleCloseRoleDialog();
            toast.success(`Role updated successfully to ${selectedRole}`);
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleDelete = async (user) => {
        await deleteUser(user.uid);
        // Optionally, refresh the data grid or state
    };

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleOpenDeleteDialog = (user) => {
        toast.success('Opening delete dialog for user:', user);
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        try {
            if (!selectedUser) {
                toast.error('No user selected');
                return;
            }
            await deleteUser(selectedUser.uid);
            handleCloseDeleteDialog();
            toast.success('User deleted successfully');
            
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const columns = [
        { field: 'id', headerName: 'S.No.', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'email', headerName: 'Email', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'date', headerName: 'Date', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'role', headerName: 'Role', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'dateOfBirth', headerName: 'Date of Birth', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'country', headerName: 'Country', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'profession', headerName: 'Profession', flex: 1, headerAlign: 'center', align: 'center' },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <div>
                    <IconButton
                        onClick={() => handleClickOpenRoleDialog(params.row)}
                        color="primary"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleOpenDeleteDialog(params.row)}
                        color="secondary"
                        size="small"
                    >
                        <DeleteIcon style={{ color: 'red' }} />
                    </IconButton>
                </div>
            ),
        },
    ];

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Modern Header with Gradient */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    px: 4,
                    py: 4,
                    mb: 4,
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                }}
            >
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    User Management
                </Typography>
                <Typography 
                    variant="body1" 
                    sx={{ 
                        opacity: 0.95,
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    Manage your team members and their account permissions here.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                <Card 
                    sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                        }
                    }}
                >
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Total Users
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            {filteredUsers.length}
                        </Typography>
                    </CardContent>
                </Card>

                <Card 
                    sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                        }
                    }}
                >
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Admin Users
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            {filteredUsers.filter(u => u.role === 'admin').length}
                        </Typography>
                    </CardContent>
                </Card>

                <Card 
                    sx={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        borderRadius: '16px',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                        }
                    }}
                >
                    <CardContent>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Regular Users
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            {filteredUsers.filter(u => u.role === 'user').length}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Search and Actions Bar */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    mb: 3,
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            All users
                        </Typography>
                        <Chip 
                            label={filteredUsers.length}
                            sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontWeight: 600
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            placeholder="Search users..."
                            size="small"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#667eea' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: '240px',
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    '&:hover fieldset': {
                                        borderColor: '#667eea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    }
                                }
                            }}
                        />
                        
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={handleFilterClick}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                color: '#667eea',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#667eea',
                                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                                }
                            }}
                        >
                            Filters
                            {Object.values(filters).some(value => value !== 'all') && (
                                <Chip
                                    label="Active"
                                    size="small"
                                    sx={{ 
                                        ml: 1,
                                        height: '20px',
                                        bgcolor: '#667eea',
                                        color: 'white',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            )}
                        </Button>

                    <Popover
                        open={Boolean(filterAnchorEl)}
                        anchorEl={filterAnchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                p: 2,
                                width: 300,
                                borderRadius: '12px',
                            }
                        }}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <Select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="all">All roles</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date joined
                                </label>
                                <Select
                                    value={filters.dateJoined}
                                    onChange={(e) => handleFilterChange('dateJoined', e.target.value)}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="all">Any time</MenuItem>
                                    <MenuItem value="last7days">Last 7 days</MenuItem>
                                    <MenuItem value="last30days">Last 30 days</MenuItem>
                                    <MenuItem value="last90days">Last 90 days</MenuItem>
                                </Select>
                            </div>

                            

                            <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                    onClick={() => {
                                        setFilters({
                                            role: 'all',
                                            dateJoined: 'all',
                                            lastActive: 'all'
                                        });
                                    }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Reset filters
                                </Button>
                                <Button 
                                    onClick={handleFilterClose}
                                    variant="contained"
                                    sx={{ 
                                        textTransform: 'none',
                                        backgroundColor: '#1a1a1a',
                                        '&:hover': {
                                            backgroundColor: '#000',
                                        }
                                    }}
                                >
                                    Apply filters
                                </Button>
                            </div>
                        </div>
                    </Popover>

                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                }
                            }}
                        >
                            Add user
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Table */}
            <Paper 
                elevation={0}
                sx={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: '100%', width: '100%' }}>
                        <thead>
                            <tr style={{ 
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                <th style={{ width: '40px', padding: '16px' }}>
                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                </th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                                    User name
                                </th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                                    Access
                                </th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                                    Last active
                                </th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
                                    Date joined
                                </th>
                                <th style={{ width: '100px', padding: '16px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                        {rows.length > 0 ? (
                            rows.map((user) => (
                                <tr 
                                    key={user.id} 
                                    style={{ 
                                        borderBottom: '1px solid #f0f0f0',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px' }}>
                                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                src={user.photoURL} 
                                                alt={user.name}
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    border: '2px solid',
                                                    borderColor: 'rgba(102, 126, 234, 0.2)'
                                                }}
                                            >
                                                {user.name?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {user.role === 'admin' ? (
                                                // Admin chips
                                                <>
                                                    <Chip 
                                                        label="Admin" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip 
                                                        label="Manage Products" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip 
                                                        label="Manage Orders" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip 
                                                        label="Manage Users" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                // Regular user chips
                                                <>
                                                <Chip 
                                                        label="User" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip 
                                                        label="Make Orders" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip 
                                                        label="View History" 
                                                        size="small"
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            height: '26px',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </Box>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Typography sx={{ color: '#666' }}>
                                            {user.lastActive || 'Never'}
                                        </Typography>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Typography sx={{ color: '#666' }}>
                                            {user.date}
                                        </Typography>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                onClick={() => handleClickOpenRoleDialog(user)}
                                                sx={{
                                                    color: '#667eea',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <AccountCircleIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleOpenDeleteDialog(user)}
                                                sx={{
                                                    color: '#ef4444',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                                    <Typography variant="body1" sx={{ color: '#999' }}>
                                        No users found matching your search.
                                    </Typography>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Box>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            p: 3, 
                            borderTop: '1px solid #f0f0f0',
                            background: 'rgba(102, 126, 234, 0.02)'
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                    color: page === 1 ? '#ccc' : '#667eea',
                                    '&:hover': {
                                        borderColor: '#667eea',
                                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                                    },
                                    '&:disabled': {
                                        borderColor: '#e0e0e0',
                                        color: '#ccc',
                                    }
                                }}
                            >
                                Previous
                            </Button>
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <Button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        variant={page === pageNumber ? 'contained' : 'outlined'}
                                        size="small"
                                        sx={{
                                            minWidth: '40px',
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            ...(page === pageNumber ? {
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                                }
                                            } : {
                                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                                color: '#667eea',
                                                '&:hover': {
                                                    borderColor: '#667eea',
                                                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                                                }
                                            })
                                        }}
                                    >
                                        {pageNumber}
                                    </Button>
                                );
                            })}
                            <Button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                    color: page === totalPages ? '#ccc' : '#667eea',
                                    '&:hover': {
                                        borderColor: '#667eea',
                                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                                    },
                                    '&:disabled': {
                                        borderColor: '#e0e0e0',
                                        color: '#ccc',
                                    }
                                }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Keep existing dialogs */}
            
            {/* Role Dialog */}
            <Dialog 
                open={openRoleDialog} 
                onClose={handleCloseRoleDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '20px 24px',
                        fontSize: '18px',
                        fontWeight: '600',
                    }}
                >
                    Update user role
                </DialogTitle>
                <DialogContent sx={{ padding: '24px' }}>
                    <DialogContentText sx={{ marginBottom: '20px', color: '#6b7280' }}>
                        Select a new role for <span className="font-medium text-gray-900">{selectedUser?.name}</span>
                    </DialogContentText>
                    <div className="flex flex-col gap-3">
                        <Button
                            variant={selectedRole === 'admin' ? 'contained' : 'outlined'}
                            startIcon={<AdminPanelSettingsIcon />}
                            onClick={() => setSelectedRole('admin')}
                            className="justify-start"
                            sx={{
                                borderColor: '#e0e0e0',
                                color: selectedRole === 'admin' ? '#fff' : '#2e7d32',
                                backgroundColor: selectedRole === 'admin' ? '#2e7d32' : 'transparent',
                                textTransform: 'none',
                                padding: '12px 16px',
                                '&:hover': {
                                    borderColor: '#2e7d32',
                                    backgroundColor: selectedRole === 'admin' ? '#2e7d32' : '#e8f5e9',
                                }
                            }}
                        >
                            Admin
                        </Button>
                        <Button
                            variant={selectedRole === 'user' ? 'contained' : 'outlined'}
                            startIcon={<PersonIcon />}
                            onClick={() => setSelectedRole('user')}
                            className="justify-start"
                            sx={{
                                borderColor: '#e0e0e0',
                                color: selectedRole === 'user' ? '#fff' : '#1976d2',
                                backgroundColor: selectedRole === 'user' ? '#1976d2' : 'transparent',
                                textTransform: 'none',
                                padding: '12px 16px',
                                '&:hover': {
                                    borderColor: '#1976d2',
                                    backgroundColor: selectedRole === 'user' ? '#1976d2' : '#e3f2fd',
                                }
                            }}
                        >
                            User
                        </Button>
                    </div>
                </DialogContent>
                <DialogActions sx={{ 
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    padding: '16px 24px',
                    gap: '12px'
                }}>
                    <Button 
                        onClick={handleCloseRoleDialog} 
                        sx={{
                            textTransform: 'none',
                            color: '#666',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                borderColor: '#d5d5d5',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmRoleChange} 
                        variant="contained"
                        autoFocus
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            '&:hover': {
                                backgroundColor: '#000',
                            }
                        }}
                    >
                        Save changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog
                open={openCreateDialog}
                onClose={handleCloseCreateDialog}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                    }
                }}
            >
                <DialogTitle sx={{ backgroundColor: '#f1f1f1', color: '#005689', fontWeight: 'bold', fontSize: '20px' }}>New Account</DialogTitle>
                <DialogContent>
                    <UserCreationForm /> {/* Render your user creation form component */}
                </DialogContent>

                <DialogActions sx={{ backgroundColor: '#f1f1f1' }}>
                    <Button 
                        onClick={handleCloseCreateDialog} 
                        sx={{
                            textTransform: 'none',
                            color: '#667eea',
                            fontWeight: 600,
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add this dialog component */}
            <Dialog 
                open={openDeleteDialog} 
                onClose={handleCloseDeleteDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '20px 24px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#dc2626' // red color for warning
                    }}
                >
                    Delete user
                </DialogTitle>
                <DialogContent sx={{ padding: '24px' }}>
                    <DialogContentText sx={{ color: '#6b7280' }}>
                        Are you sure you want to delete <span className="font-medium text-gray-900">{selectedUser?.name}</span>? 
                        <br />
                        <span className="text-sm mt-2 block text-red-600">
                            This action cannot be undone.
                        </span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ 
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    padding: '16px 24px',
                    gap: '12px'
                }}>
                    <Button 
                        onClick={handleCloseDeleteDialog} 
                        sx={{
                            textTransform: 'none',
                            color: '#666',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                borderColor: '#d5d5d5',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteUser}
                        variant="contained"
                        color="error"
                        autoFocus
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#dc2626',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            '&:hover': {
                                backgroundColor: '#b91c1c',
                            }
                        }}
                    >
                        Delete user
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UserDetail;