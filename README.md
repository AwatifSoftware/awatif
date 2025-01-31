Awatif.co helps you build parametric structural engineering apps that run on the web or offline, featuring real-time FEM analysis and design. 

- For more information, check our website: https://awatif.co/
- To understand the vision, watch this video: https://www.youtube.com/watch?v=QkoFJGfD7rc
- To understand the architecture, watch this video: https://www.youtube.com/watch?v=4NdFQGouIjU

## Roadmap
- [x] FEM: Bar & beam elements [Example](https://lnkd.in/di83wh_b)
- [ ] FEM: Plate & shell elements (coming soon)
- [x] FEM: Static simulations [Example](https://lnkd.in/dAadJkTC)
- [ ] FEM: Dynamic simulations
- [ ] FEM: Nonlinear analysis
- [x] FEM: Meshing [Example](https://lnkd.in/dE5PNb-4)
- [ ] Design: Member checks (coming soon)
- [ ] Design: Connection checks
- [x] UI: Tabular editing [Example](https://lnkd.in/dHfwFHRF)
- [x] UI: Drawing [Example](https://lnkd.in/dbiG7ASX)
- [ ] UI: Reporting (coming soon)
- [ ] UI: Element selection
- [x] Structural Systems: Truss design [Example](https://lnkd.in/dr72G_wH)
- [ ] Structural Systems: Building design (coming soon)

## Stack 
1. **VanJS**: for handling reactive state [Docs](https://vanjs.org/)
2. **Three.js**: for 3D rendering and operations [Docs](https://threejs.org/)
3. **Lit-html**: for templating [Docs](https://lit.dev/docs/libraries/standalone-templates/)
4. **W2UI**: for UI components [Docs](https://w2ui.com/web/home)

## Coding style
Here is a typical function with structure and style in mind:
```ts
function mesh({ polygon }: { polygon: number[] }): { elements: number[][] } {
  // Init
  const elements = [];

  // Update
  elements.push([1, 2, 3]);

  // Events
  van.drive(() => {
    render(elements.val);
  });

  return { elements };
}
```

- Focus on simplicity and stick to core features. Prioritize the minimum viable product by identifying essential elements. The system is already complex, and additional complexity will naturally arise, so maintaining simplicity is crucial.
- Functions should fully describe their inputs and outputs using types to improve interfacing with other functions.
- To organize the logic and improves readability, divide it into three blocks, as shown above:
  - Init: Initializes all variables.
  - Update: Updates variables.
  - Events: Handles event listeners.
- If a function has no return value, it modifies a global state, which is generally not recommended as it can lead to more bugs over time. However, if unavoidable due to legacy code, consider using reactive objects and handling changes as events using the signal approach.
