# lanyard-profile-readme

Pretty much the same as [upstream repo](https://github.com/cnrad/lanyard-profile-readme), with custom stylings.

Additionally, `Time Left` is now supported and displayed over `Elapsed Time` whenever possible.

Please do consider giving this fork a star 🌟 if you liked it, it means a lot :)

Credit to [@NYRI4](https://github.com/NYRI4) for the wave asset and original animation CSS rules.

```url
https://lanyard.kyrie25.me/api/368399721494216706
```

![img](https://lanyard.kyrie25.me/api/368399721494216706)

## Options

**Everything from [upstream](https://github.com/cnrad/lanyard-profile-readme#options)**, in addition with my own below:

- Avatar decorator is now supported! It is enabled by default:

![decoration](https://github.com/kyrie25/lanyard-profile-readme/assets/77577746/2dde5beb-17f3-4fd9-975a-3d3d71dff02e)

![decoration-square](https://github.com/kyrie25/lanyard-profile-readme/assets/77577746/49ddc4d4-70fb-46ee-a192-6acdae831f5b)

If you wish to disable it (because the round decoration on square image look weird perhaps?), you can use `decoration=false`:

```url
https://lanyard.kyrie25.me/api/368399721494216706?decoration=false
```

- You can choose to use your display name instead of username using `useDisplayName=true`:

```url
https://lanyard.kyrie25.me/api/368399721494216706?useDisplayName=true
```

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
