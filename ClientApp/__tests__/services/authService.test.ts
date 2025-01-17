import { getAxiosInstance } from "@/services/axiosInstance";
import { clearTokens, saveTokens, startTokenRefresh, stopTokenRefresh } from "@/services/tokenService";
import { loginUser, logoutUser, registerUser, resetPassword } from "@/services/authService";
import { useDispatch } from 'react-redux';
import { clearUser } from "@/state/user/userSlice";
import { API_ENDPOINTS } from "@/utils/api/endpoints";


jest.mock('@/services/axiosInstance', () => {
    const mockAxiosInstance = {
        post: jest.fn(),
        put: jest.fn()
    };
    return {
        getAxiosInstance: jest.fn(() => mockAxiosInstance),
    };
});

jest.mock('@/services/tokenService', () => ({
    clearTokens: jest.fn(),
    stopTokenRefresh: jest.fn(),
    saveTokens: jest.fn(),
    startTokenRefresh: jest.fn(),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
  }));

describe('Auth Service Tests', () => {
    let axiosInstance: any;

    beforeAll(() => {
        axiosInstance = getAxiosInstance();
    });


    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should save tokens and start refresh timer upon successful login', async () => {
        const mockData = {
            userID: 123,
            tokenResponse: {
                accessToken: 'fake-access-token',
                refreshToken: 'fake-refresh-token',
            },
        };

        (axiosInstance.post as jest.Mock).mockResolvedValueOnce({ data: mockData });

        await loginUser('username', 'password');

        expect(saveTokens).toHaveBeenCalledWith(mockData.tokenResponse.accessToken, mockData.tokenResponse.refreshToken);
        expect(startTokenRefresh).toHaveBeenCalledTimes(1);
    });

    it('should throw error on login failure', async () => {
        (getAxiosInstance().post as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

        await expect(loginUser('username', 'password')).rejects.toThrow('Login failed');
        expect(saveTokens).not.toHaveBeenCalled();
        expect(startTokenRefresh).not.toHaveBeenCalled();
    });

    it('should clear tokens and stop refresh timer on logout', async () => {
        const mockDispatch = jest.fn();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (clearTokens as jest.Mock).mockResolvedValueOnce(true);
        (stopTokenRefresh as jest.Mock).mockResolvedValueOnce(null); 

        await logoutUser(mockDispatch);

        expect(clearTokens).toHaveBeenCalledTimes(1);
        expect(stopTokenRefresh).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(clearUser());
    });


    it("should throw error if not user not found during reset password", async () => {
      
        const mockError = {
            response: {
              data: "User not found",
            },
          };

        (axiosInstance.put as jest.Mock).mockRejectedValueOnce(mockError);
        
        await expect(resetPassword("test@example.com")).rejects.toEqual(
            "User not found"
          );
    
        expect(axiosInstance.put).toHaveBeenCalledWith(
          API_ENDPOINTS.RESET_PASSWORD, 
          { email: "test@example.com" }
        );
      });

      it("successful reset password", async () => {
        
        const mockResponse = { data: "Password reset email sent" };
        (axiosInstance.put as jest.Mock).mockResolvedValueOnce(mockResponse);
        
        const result = await resetPassword("test@example.com");

        expect(axiosInstance.put).toHaveBeenCalledWith(
          API_ENDPOINTS.RESET_PASSWORD, 
          { email: "test@example.com" }
        );

        expect(result).toEqual(mockResponse);
      });

      it("should successfully create a user", async () => {
        const mockData = {
            email: 'test@email.com',
            username: 'test',
            password: 'test'
        }
        const mockResponse = { data: { message: "User registered successfully" } };
        (axiosInstance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const result = await registerUser(mockData.email, mockData.username, mockData.password)
        expect(axiosInstance.post).toHaveBeenCalledWith(
            API_ENDPOINTS.REGISTER, 
            {
              email: mockData.email,
              username: mockData.username,
              password: mockData.password,
            }
          );
          expect(result).toEqual(mockResponse);
      })


      it("should throw a generic error if no response is present", async () => {
        const mockError = new Error("Network Error");
        (axiosInstance.put as jest.Mock).mockRejectedValueOnce(mockError);
    
        await expect(resetPassword("test@example.com")).rejects.toThrow("Network Error");
    
        expect(axiosInstance.put).toHaveBeenCalledWith(
          API_ENDPOINTS.RESET_PASSWORD, 
          { email: "test@example.com" }
        );
      });

      it("should throw an error if registration fails with a response", async () => {
       
        const mockError = {
          response: {
            data: { message: "Email already exists" },
          },
        };
        (axiosInstance.post as jest.Mock).mockRejectedValueOnce(mockError);
    
        await expect(
          registerUser("existing@example.com", "testuser", "password123")
        ).rejects.toEqual({ message: "Email already exists" });
    
        expect(axiosInstance.post).toHaveBeenCalledWith(
          API_ENDPOINTS.REGISTER, // Replace with the actual API endpoint
          {
            email: "existing@example.com",
            username: "testuser",
            password: "password123",
          }
        );
      });

      it("should throw a generic error if no response is provided", async () => {
        // Mock a network or unexpected error without a response object
        const mockError = new Error("Network Error");
        (axiosInstance.post as jest.Mock).mockRejectedValueOnce(mockError);
    
        await expect(
          registerUser("test@example.com", "testuser", "password123")
        ).rejects.toThrow("Network Error");
    
        expect(axiosInstance.post).toHaveBeenCalledWith(
          API_ENDPOINTS.REGISTER, 
          {
            email: "test@example.com",
            username: "testuser",
            password: "password123",
          }
        );
      });


      it('should handle an error when clearTokens fails during logout', async () => {
        const mockDispatch = jest.fn();
        const mockError = new Error("Failed to clear tokens");
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
        (clearTokens as jest.Mock).mockRejectedValueOnce(mockError);
        jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(logoutUser(mockDispatch)).rejects.toThrow("Failed to clear tokens");
    
        expect(clearTokens).toHaveBeenCalledTimes(1);
        expect(mockDispatch).not.toHaveBeenCalledWith(clearUser());
        expect(stopTokenRefresh).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Error Loging out user:", mockError);
        
    });


});