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
https://lanyard.kyrie25.dev/api/368399721494216706
https://lanyard.kyrie25.dev/api/368399721494216706?theme=light
```

<div>
    <img src="./.github/images/dark.svg" />
    <img src="./.github/images/light.svg" />
</div>

## Options

**Everything from [upstream](https://github.com/cnrad/lanyard-profile-readme#options)**, in addition with my own below:

### Nameplates

- Nameplates are supported and enabled by default.
- Animated nameplates are **not supported**, as Discord uses WebM for animated assets, making it costly and time-consuming to convert to PNG. (this may change in the future)

If you wish to disable it, you can use `hideNameplate=true`.

```url
https://lanyard.kyrie25.dev/api/368399721494216706?hideNameplate=true
```

### Banners

- Banners are supported and can be enabled
- Banner from USRBG **are supported**, and Nitro banners are prioritized over USRBG banners.

```url
https://lanyard.kyrie25.dev/api/368399721494216706?showBanner=true
```

```url
https://lanyard.kyrie25.dev/api/368399721494216706?showBanner=animated
```

You can combine this with `waveColor=transparent` and `waveSpotifyColor=transparent` to make the banner more visible.

```url
https://lanyard.kyrie25.dev/api/368399721494216706?showBanner=animated&waveColor=transparent&waveSpotifyColor=transparent
```

If the contents on the card are hard to read, you can use `bannerFilter` to pass in CSS filter for the banner.

```url
https://lanyard.kyrie25.dev/api/368399721494216706?showBanner=animated&waveColor=transparent&bannerFilter=brightness(0.8)%20blur(2px)
```

#### Banners are disabled by default & caveats

Banners are disabled by default because not every card will look good with it. It would also increase the API's response time, and you may hit the 5MB limit for assets on markdown files if you have a lot of animated assets in your card.

Banners are **cached for 5 minutes** to avoid API rate limit.

Experiment with it and see if it fits your needs!

### Avatar Decoration

- Avatar decorations from Decor **are supported**, and Nitro decorations are prioritized over Decor decorations.

### Activity Customizations

- Use `animationDuration` to customize the speed of the wave animation (`0s` to disable)

```url
https://lanyard.kyrie25.dev/api/368399721494216706?animationDuration=4s
```

- Define activity color using `waveColor` and `waveSpotifyColor`

```url
https://lanyard.kyrie25.dev/api/368399721494216706?waveColor=FF597B&waveSpotifyColor=FF597B
```

### Text & Image Customizations

You can also change the color of the text by specifying theme following the hex color code. \
E.g. `waveColor=FF597B-light` will make the text darker.

- Use custom gradient colors for your user name using `gradient`

```url
https://lanyard.kyrie25.dev/api/368399721494216706?gradient=645CBB-A084DC-BFACE2-EBC7E6
```

- Change your profile picture/images style using `imgStyle` and `imgBorderRadius`
  - `imgStyle`: Defines style for your profile picture and activity small image.
    - Default: `circle`
    - Accepts: `circle`, `square`
  - `imgBorderRadius`: Define border radius for your profile picture, status indicator, and activity images.
    - Profile picture and activity small image unaffected if `imgStyle` is not `square` because, well, circle lol.
    - Default: `10px`

```url
https://lanyard.kyrie25.dev/api/368399721494216706?imgStyle=square
```

```url
https://lanyard.kyrie25.dev/api/368399721494216706?imgStyle=square&imgBorderRadius=15px
```
