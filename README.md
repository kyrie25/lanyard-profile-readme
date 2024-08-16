# lanyard-profile-readme

Pretty much the same as [upstream repo](https://github.com/cnrad/lanyard-profile-readme), with custom stylings.

Some niche features are also added:

- [Banners are supported!](#banners)
- `Time Left` are supported and displayed over `Elapsed Time` whenever possible.
- Show large image of activities with only application icons. (e.g. CS2, BG3, Genshin, WuWa, etc.)
- Allows displaying special activities.

Please do consider giving this fork a star 🌟 if you liked it, it means a lot :)

Credit to [@NYRI4](https://github.com/NYRI4) for the wave asset and original animation CSS rules.

```url
https://lanyard.kyrie25.me/api/368399721494216706
```

![img](https://lanyard.kyrie25.me/api/368399721494216706)

## Options

**Everything from [upstream](https://github.com/cnrad/lanyard-profile-readme#options)**, in addition with my own below:

### Banners

- Banners are supported and can be enabled

```url
https://lanyard.kyrie25.me/api/368399721494216706?showBanner=true
```

![banner](https://github.com/user-attachments/assets/38f2f4e2-c80f-4ffd-9057-670536696776)

```url
https://lanyard.kyrie25.me/api/368399721494216706?showBanner=animated
```

![animated-banner](https://github.com/user-attachments/assets/bcdcb73a-bf6a-410f-8589-ec85f3e6b238)

You can combine this with `waveColor=transparent` and `waveSpotifyColor=transparent` to make the banner more visible.

```url
https://lanyard.kyrie25.me/api/368399721494216706?showBanner=animated&waveColor=transparent&waveSpotifyColor=transparent
```

![banner-transparent](https://github.com/user-attachments/assets/d2934faf-6c92-4dad-884f-43c57763a8ac)

#### Banners are disabled by default & caveats

Banners are disabled by default because not every card will look good with it. It would also increase the API's response time, and [may exceed Vercel's serverless function's limit](https://vercel.com/guides/how-to-bypass-vercel-body-size-limit-serverless-functions) if you have a lot of animated assets in your card.

Banners are **cached for 1 minute** to avoid API rate limit.

Experiment with it and see if it fits your needs!

### Avatar Decorator

- Avatar decorator are supported! It is enabled by default:

![decoration](https://github.com/kyrie25/lanyard-profile-readme/assets/77577746/0fb9a445-1973-4a81-831f-03b0c9e10c69)

![decoration-square](https://github.com/kyrie25/lanyard-profile-readme/assets/77577746/69e1db08-e9cf-4da2-94f4-d3232df7ad63)

If you wish to disable it (because the round decoration on square image look weird perhaps?), you can use `decoration=false`:

```url
https://lanyard.kyrie25.me/api/368399721494216706?decoration=false
```

- You can choose to use your display name instead of username using `useDisplayName=true`:

```url
https://lanyard.kyrie25.me/api/368399721494216706?useDisplayName=true
```

![display-name](https://github.com/kyrie25/lanyard-profile-readme/assets/77577746/a57e6d7a-ba42-4fc0-b3fd-752dde7800a5)

### Activity Customizations

- Use `animationDuration` to customize the speed of the wave animation (`0s` to disable)

```url
https://lanyard.kyrie25.me/api/368399721494216706?animationDuration=4s
```

![duration showcase](https://user-images.githubusercontent.com/77577746/223082326-0a3b1af6-099c-4e89-b320-52066aebb527.svg)

- Define activity color using `waveColor` and `waveSpotifyColor`

```url
https://lanyard.kyrie25.me/api/368399721494216706?waveColor=FF597B&waveSpotifyColor=FF597B
```

![waveColor showcase](https://user-images.githubusercontent.com/77577746/223082809-14b38bbc-c600-4b62-ba74-f242dada553b.svg)

### Text & Image Customizations

You can also change the color of the text by specifying theme following the hex color code. \
E.g. `waveColor=FF597B-light` will make the text darker.

- Use custom gradient colors for your user name using `gradient`

```url
https://lanyard.kyrie25.me/api/368399721494216706?gradient=645CBB-A084DC-BFACE2-EBC7E6
```

![gradient showcase](https://user-images.githubusercontent.com/77577746/223083367-828a7aba-dc1f-430d-89cf-a361c970e1cd.svg)

- Change your profile picture/images style using `imgStyle` and `imgBorderRadius`
  - `imgStyle`: Defines style for your profile picture and activity small image.
    - Default: `circle`
    - Accepts: `circle`, `square`
  - `imgBorderRadius`: Define border radius for your profile picture, status indicator, and activity images.
    - Profile picture and activity small image unaffected if `imgStyle` is not `square` because, well, circle lol.
    - Default: `10px`

```url
https://lanyard.kyrie25.me/api/368399721494216706?imgStyle=square
```

![imgStyle showcase](https://user-images.githubusercontent.com/77577746/227162049-8b99c39c-91f3-4e6a-bf37-f7dff5c64a6d.svg)

```url
https://lanyard.kyrie25.me/api/368399721494216706?imgStyle=square&imgBorderRadius=15px
```

![imgBorderRadius showcase](https://user-images.githubusercontent.com/77577746/227757276-84085324-249f-4eb8-93f2-c1149430543a.svg)
