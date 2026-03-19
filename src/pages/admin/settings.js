import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { EditIcon, AddIcon, DeleteIcon, SettingsIcon } from "@chakra-ui/icons";
import AdminLayout from "../../components/admin/admin-layout";

export default function SystemSettings() {
  const [settings, setSettings] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);

      const [settingsResponse, adminsResponse] = await Promise.all([
        fetch("/api/admin/settings", { credentials: "include" }),
        fetch("/api/admin/settings/admins", { credentials: "include" }),
      ]);

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.settings);
      }

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData.admins);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to fetch settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (section, data) => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ section, data }),
      });

      if (response.ok) {
        toast({
          title: "Settings saved successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        fetchSettings(); // Refresh settings
      } else {
        toast({
          title: "Failed to save settings",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "red";
      case "admin":
        return "blue";
      case "moderator":
        return "green";
      case "content_manager":
        return "purple";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="System Settings">
        <Flex align="center" justify="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="System Settings">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            System Settings
          </Text>
          <Text color="gray.600">
            Configure system-wide settings and manage administrators
          </Text>
        </VStack>

        <Tabs>
          <TabList>
            <Tab>General Settings</Tab>
            <Tab>Game Settings</Tab>
            <Tab>Security Settings</Tab>
            <Tab>Administrators</Tab>
          </TabList>

          <TabPanels>
            {/* General Settings Tab */}
            <TabPanel>
              <GeneralSettings
                settings={settings}
                onSave={handleSaveSettings}
                isSaving={isSaving}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>

            {/* Game Settings Tab */}
            <TabPanel>
              <GameSettings
                settings={settings}
                onSave={handleSaveSettings}
                isSaving={isSaving}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>

            {/* Security Settings Tab */}
            <TabPanel>
              <SecuritySettings
                settings={settings}
                onSave={handleSaveSettings}
                isSaving={isSaving}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>

            {/* Administrators Tab */}
            <TabPanel>
              <AdministratorManagement
                admins={admins}
                onRefresh={fetchSettings}
                bgColor={bgColor}
                borderColor={borderColor}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </AdminLayout>
  );
}

// General Settings Component
function GeneralSettings({ settings, onSave, isSaving, bgColor, borderColor }) {
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsers: 10000,
    defaultLanguage: "en",
    timezone: "UTC",
  });

  useEffect(() => {
    if (settings?.general) {
      setFormData(settings.general);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave("general", formData);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">General Settings</Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl>
                <FormLabel>Site Name</FormLabel>
                <Input
                  value={formData.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  placeholder="StoryType"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Default Language</FormLabel>
                <Select
                  value={formData.defaultLanguage}
                  onChange={(e) =>
                    handleChange("defaultLanguage", e.target.value)
                  }
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Select
                  value={formData.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Maximum Users</FormLabel>
                <NumberInput
                  value={formData.maxUsers}
                  onChange={(value) =>
                    handleChange("maxUsers", parseInt(value))
                  }
                  min={100}
                  max={1000000}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Site Description</FormLabel>
              <Textarea
                value={formData.siteDescription}
                onChange={(e) =>
                  handleChange("siteDescription", e.target.value)
                }
                placeholder="Enter site description"
                rows={3}
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Maintenance Mode</FormLabel>
                <Switch
                  isChecked={formData.maintenanceMode}
                  onChange={(e) =>
                    handleChange("maintenanceMode", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Registration Enabled</FormLabel>
                <Switch
                  isChecked={formData.registrationEnabled}
                  onChange={(e) =>
                    handleChange("registrationEnabled", e.target.checked)
                  }
                />
              </FormControl>
            </Grid>

            <Button type="submit" colorScheme="blue" isLoading={isSaving}>
              Save General Settings
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}

// Game Settings Component
function GameSettings({ settings, onSave, isSaving, bgColor, borderColor }) {
  const [formData, setFormData] = useState({
    defaultTestDuration: 60,
    minTestDuration: 10,
    maxTestDuration: 600,
    allowCustomDuration: true,
    enableBackspace: true,
    enableNumbers: true,
    enableSymbols: true,
    enableCaseSensitive: false,
    defaultDifficulty: "medium",
    enableMultiplayer: true,
    maxMultiplayerUsers: 50,
  });

  useEffect(() => {
    if (settings?.game) {
      setFormData(settings.game);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave("game", formData);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">Game Settings</Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} w="full">
              <FormControl>
                <FormLabel>Default Test Duration (seconds)</FormLabel>
                <NumberInput
                  value={formData.defaultTestDuration}
                  onChange={(value) =>
                    handleChange("defaultTestDuration", parseInt(value))
                  }
                  min={10}
                  max={600}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Min Test Duration (seconds)</FormLabel>
                <NumberInput
                  value={formData.minTestDuration}
                  onChange={(value) =>
                    handleChange("minTestDuration", parseInt(value))
                  }
                  min={5}
                  max={300}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Max Test Duration (seconds)</FormLabel>
                <NumberInput
                  value={formData.maxTestDuration}
                  onChange={(value) =>
                    handleChange("maxTestDuration", parseInt(value))
                  }
                  min={60}
                  max={1800}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Default Difficulty</FormLabel>
                <Select
                  value={formData.defaultDifficulty}
                  onChange={(e) =>
                    handleChange("defaultDifficulty", e.target.value)
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Max Multiplayer Users</FormLabel>
                <NumberInput
                  value={formData.maxMultiplayerUsers}
                  onChange={(value) =>
                    handleChange("maxMultiplayerUsers", parseInt(value))
                  }
                  min={2}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Allow Custom Duration</FormLabel>
                <Switch
                  isChecked={formData.allowCustomDuration}
                  onChange={(e) =>
                    handleChange("allowCustomDuration", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Backspace</FormLabel>
                <Switch
                  isChecked={formData.enableBackspace}
                  onChange={(e) =>
                    handleChange("enableBackspace", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Numbers</FormLabel>
                <Switch
                  isChecked={formData.enableNumbers}
                  onChange={(e) =>
                    handleChange("enableNumbers", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Symbols</FormLabel>
                <Switch
                  isChecked={formData.enableSymbols}
                  onChange={(e) =>
                    handleChange("enableSymbols", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Case Sensitive</FormLabel>
                <Switch
                  isChecked={formData.enableCaseSensitive}
                  onChange={(e) =>
                    handleChange("enableCaseSensitive", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Multiplayer</FormLabel>
                <Switch
                  isChecked={formData.enableMultiplayer}
                  onChange={(e) =>
                    handleChange("enableMultiplayer", e.target.checked)
                  }
                />
              </FormControl>
            </Grid>

            <Button type="submit" colorScheme="blue" isLoading={isSaving}>
              Save Game Settings
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}

// Security Settings Component
function SecuritySettings({
  settings,
  onSave,
  isSaving,
  bgColor,
  borderColor,
}) {
  const [formData, setFormData] = useState({
    requireEmailVerification: false,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    enableAuditLog: true,
    enableIPWhitelist: false,
    allowedIPs: [],
  });

  useEffect(() => {
    if (settings?.security) {
      setFormData(settings.security);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave("security", formData);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <Heading size="md">Security Settings</Heading>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl>
                <FormLabel>Session Timeout (hours)</FormLabel>
                <NumberInput
                  value={formData.sessionTimeout}
                  onChange={(value) =>
                    handleChange("sessionTimeout", parseInt(value))
                  }
                  min={1}
                  max={168}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Max Login Attempts</FormLabel>
                <NumberInput
                  value={formData.maxLoginAttempts}
                  onChange={(value) =>
                    handleChange("maxLoginAttempts", parseInt(value))
                  }
                  min={3}
                  max={20}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Lockout Duration (minutes)</FormLabel>
                <NumberInput
                  value={formData.lockoutDuration}
                  onChange={(value) =>
                    handleChange("lockoutDuration", parseInt(value))
                  }
                  min={5}
                  max={1440}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Require Email Verification</FormLabel>
                <Switch
                  isChecked={formData.requireEmailVerification}
                  onChange={(e) =>
                    handleChange("requireEmailVerification", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Require Strong Passwords</FormLabel>
                <Switch
                  isChecked={formData.requireStrongPasswords}
                  onChange={(e) =>
                    handleChange("requireStrongPasswords", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Two-Factor Authentication</FormLabel>
                <Switch
                  isChecked={formData.enableTwoFactor}
                  onChange={(e) =>
                    handleChange("enableTwoFactor", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Audit Log</FormLabel>
                <Switch
                  isChecked={formData.enableAuditLog}
                  onChange={(e) =>
                    handleChange("enableAuditLog", e.target.checked)
                  }
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable IP Whitelist</FormLabel>
                <Switch
                  isChecked={formData.enableIPWhitelist}
                  onChange={(e) =>
                    handleChange("enableIPWhitelist", e.target.checked)
                  }
                />
              </FormControl>
            </Grid>

            {formData.enableIPWhitelist && (
              <FormControl>
                <FormLabel>Allowed IP Addresses (one per line)</FormLabel>
                <Textarea
                  value={formData.allowedIPs.join("\n")}
                  onChange={(e) =>
                    handleChange(
                      "allowedIPs",
                      e.target.value.split("\n").filter((ip) => ip.trim())
                    )
                  }
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  rows={5}
                />
              </FormControl>
            )}

            <Button type="submit" colorScheme="blue" isLoading={isSaving}>
              Save Security Settings
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}

// Administrator Management Component
function AdministratorManagement({ admins, onRefresh, bgColor, borderColor }) {
  const toast = useToast();

  const handleToggleAdminStatus = async (adminId, isActive) => {
    try {
      const response = await fetch(`/api/admin/settings/admins/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast({
          title: `Admin ${
            !isActive ? "activated" : "deactivated"
          } successfully`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onRefresh();
      } else {
        toast({
          title: "Failed to update admin status",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      toast({
        title: "Error updating admin status",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "red";
      case "admin":
        return "blue";
      case "moderator":
        return "green";
      case "content_manager":
        return "purple";
      default:
        return "gray";
    }
  };

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Administrators</Heading>
          Executive
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {admins.map((admin) => (
            <HStack
              key={admin._id}
              justify="space-between"
              p={4}
              bg="gray.50"
              rounded="md"
            >
              <VStack align="flex-start" spacing={1}>
                <HStack spacing={2}>
                  <Text fontWeight="medium">{admin.username}</Text>
                  <Badge colorScheme={getRoleBadgeColor(admin.role)}>
                    {admin.role.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge colorScheme={admin.isActive ? "green" : "red"}>
                    {admin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  {admin.email}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Last login:{" "}
                  {admin.lastLogin
                    ? new Date(admin.lastLogin).toLocaleString()
                    : "Never"}
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme={admin.isActive ? "red" : "green"}
                  variant="outline"
                  onClick={() =>
                    handleToggleAdminStatus(admin._id, admin.isActive)
                  }
                >
                  {admin.isActive ? "Deactivate" : "Activate"}
                </Button>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}
