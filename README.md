--[[
  Aimbot Simples para Roblox
  - Mira apenas na cabeça dos inimigos (não aliados)
  - Interface gráfica própria (GUI)
--]]

-- Configurações
local aimKey = Enum.UserInputType.MouseButton2 -- Botão direito do mouse
local aimFOV = 100 -- Raio de detecção para mira automática

-- Cria GUI simples
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "AimbotGUI"
ScreenGui.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")

local AimCircle = Instance.new("Frame", ScreenGui)
AimCircle.AnchorPoint = Vector2.new(0.5, 0.5)
AimCircle.Position = UDim2.new(0.5, 0, 0.5, 0)
AimCircle.Size = UDim2.new(0, aimFOV*2, 0, aimFOV*2)
AimCircle.BackgroundTransparency = 1
AimCircle.BorderSizePixel = 0

local Circle = Instance.new("ImageLabel", AimCircle)
Circle.Size = UDim2.new(1,0,1,0)
Circle.BackgroundTransparency = 1
Circle.Image = "rbxassetid://2712565063" -- círculo branco
Circle.ImageColor3 = Color3.fromRGB(0,200,255)
Circle.ImageTransparency = 0.5

-- Função para encontrar o inimigo mais próximo dentro do FOV
local function GetClosestEnemy()
    local player = game.Players.LocalPlayer
    local camera = workspace.CurrentCamera
    local closestDistance = aimFOV
    local target = nil

    for _,other in ipairs(game.Players:GetPlayers()) do
        if other ~= player and other.Team ~= player.Team and other.Character and other.Character:FindFirstChild("Head") then
            local headPosition = other.Character.Head.Position
            local screenPoint, onScreen = camera:WorldToViewportPoint(headPosition)
            if onScreen then
                local mousePos = Vector2.new(camera.ViewportSize.X/2, camera.ViewportSize.Y/2)
                local dist = (Vector2.new(screenPoint.X, screenPoint.Y) - mousePos).Magnitude
                if dist < closestDistance then
                    closestDistance = dist
                    target = other.Character.Head
                end
            end
        end
    end
    return target
end

-- Mira automática quando botão pressionado
local uis = game:GetService("UserInputService")
local aiming = false

uis.InputBegan:Connect(function(input, processed)
    if not processed and input.UserInputType == aimKey then
        aiming = true
    end
end)
uis.InputEnded:Connect(function(input, processed)
    if input.UserInputType == aimKey then
        aiming = false
    end
end)

game:GetService("RunService").RenderStepped:Connect(function()
    if aiming then
        local target = GetClosestEnemy()
        if target then
            local camera = workspace.CurrentCamera
            camera.CFrame = CFrame.new(camera.CFrame.Position, target.Position)
        end
    end
end)

-- Mensagem de Interface
local TextLabel = Instance.new("TextLabel", ScreenGui)
TextLabel.Size = UDim2.new(0, 250, 0, 28)
TextLabel.Position = UDim2.new(0.5, -125, 0.8, 0)
TextLabel.BackgroundTransparency = 0.4
TextLabel.BackgroundColor3 = Color3.fromRGB(20,20,20)
TextLabel.TextColor3 = Color3.new(1,1,1)
TextLabel.Font = Enum.Font.SourceSansBold
TextLabel.TextSize = 20
TextLabel.Text = "Aimbot: Segure botão direito do mouse"
