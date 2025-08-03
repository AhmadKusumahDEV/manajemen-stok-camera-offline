import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline } from 'react-native-svg';
import { IconProps } from '../../types/type';
// Kita membuat komponen ini agar bisa menerima props seperti ukuran dan warna
// Ini membuat ikonnya bisa digunakan kembali (reusable)
export const HomeIcon = ({ width, height, color, strokeWidth, opacity, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      strokeOpacity={opacity}
      height={height} stroke={stokecolor}
      strokeWidth={strokeWidth}
      viewBox="0 0 256 256">
      <Path fill={color} d="M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52a4 4 0 0 0-4-4h-40a4 4 0 0 0-4 4v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a16 16 0 0 1 4.69-11.31l80-80a16 16 0 0 1 22.62 0l80 80A16 16 0 0 1 224 120" /></Svg>
  );
};

export const EmployeeIcon = ({ width, height, color, strokeWidth, opacity, stokecolor = 'gray' }: IconProps) => {
  return (
    // 3. Ganti <svg> menjadi <Svg> dan hapus atribut web seperti 'xmlns' & 'className'
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
    >
      {/* 4. Ganti <path> menjadi <Path> */}
      <Path
        fill={color} // Prop 'fill' di Svg akan jadi default untuk Path di bawahnya
        d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"
        stroke={stokecolor} // Anda bisa juga jadikan ini prop jika perlu
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    </Svg>
  );
};

export const WarehouseIcon = ({ width, height, color, strokeWidth, opacity, stokecolor = 'gray' }: IconProps) => {
  return (
    // 3. Ganti <svg> menjadi <Svg> dan hapus atribut web seperti 'xmlns' & 'className'
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
    >
      {/* 4. Ganti <path> menjadi <Path> */}
      <Path
        fill={color} // Prop 'fill' di Svg akan jadi default untuk Path di bawahnya
        d="M3 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3v-3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V16h3a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm1 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5M4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5m2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5"
        stroke={stokecolor} // Anda bisa juga jadikan ini prop jika perlu
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    </Svg>
  );
};

export const TransactionIcon = ({ width, height, color, strokeWidth, opacity, stokecolor = 'gray' }: IconProps) => {
  return (
    // 3. Ganti <svg> menjadi <Svg> dan hapus atribut web seperti 'xmlns' & 'className'
    <Svg
      width={width}
      height={height}
      viewBox="0 0 256 256"
    >
      {/* 4. Ganti <path> menjadi <Path> */}
      <Path
        fill={color} // Prop 'fill' di Svg akan jadi default untuk Path di bawahnya
        d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m-16 152H64a8 8 0 0 1 0-16h128a8 8 0 0 1 0 16m0-48H64a8 8 0 0 1 0-16h128a8 8 0 0 1 0 16m0-48H64a8 8 0 0 1 0-16h128a8 8 0 0 1 0 16"
        stroke={stokecolor} // Anda bisa juga jadikan ini prop jika perlu
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    </Svg>
  );
};

export const ProductIcon = ({ width, height, color, strokeWidth, opacity, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg width={width} height={height} fill={color} strokeWidth={strokeWidth} stroke={stokecolor} strokeOpacity={opacity} viewBox="0 0 16 16">
      <Path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
    </Svg>
  );
};

export const SearchIcon = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'black' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
};
export const FilterIcon = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'black' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </Svg>
  );
};

export const EditIcon = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
};

export const DeleteIcon = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Polyline points="3 6 5 6 21 6" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
};

export const CameraIcon = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
};

export const IconChevronRight = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
};

export const IconModify = ({ width = 24, height = 24, color = 'white', strokeWidth = 2, opacity = 1, stokecolor = 'gray' }: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Svg>
  );
};

export const IconHome = ({
  width = 24,
  height = 24,
  color = 'none', // Default 'fill' adalah 'none' sesuai SVG asli
  stokecolor = '#000000', // Default 'stroke' adalah hitam
  strokeWidth = 2, // Default 'stroke-width' adalah 2 sesuai SVG asli
  opacity = 1,
  ...props
}: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={color}
      stroke={stokecolor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      {...props} // Meneruskan props lain seperti style
    >
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
};

export const EyeIconOpen = ({
  width = 20,
  height = 16,
  color = '#000',
  opacity = 1,
}: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      opacity={opacity}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8L3.07945 4.30466C4.29638 2.84434 6.09909 2 8 2C9.90091 2 11.7036 2.84434 12.9206 4.30466L16 8L12.9206 11.6953C11.7036 13.1557 9.90091 14 8 14C6.09909 14 4.29638 13.1557 3.07945 11.6953L0 8ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
        fill={color}
      />
    </Svg>
  );
};


export const EyeIconClose = ({
  width = 20,
  height = 16,
  color = '#000',
  opacity = 1,
}: IconProps) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      opacity={opacity}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 16H13L10.8368 13.3376C9.96488 13.7682 8.99592 14 8 14C6.09909 14 4.29638 13.1557 3.07945 11.6953L0 8L3.07945 4.30466C3.14989 4.22013 3.22229 4.13767 3.29656 4.05731L0 0H3L16 16ZM5.35254 6.58774C5.12755 7.00862 5 7.48941 5 8C5 9.65685 6.34315 11 8 11C8.29178 11 8.57383 10.9583 8.84053 10.8807L5.35254 6.58774Z"
        fill={color}
      />
      <Path
        d="M16 8L14.2278 10.1266L7.63351 2.01048C7.75518 2.00351 7.87739 2 8 2C9.90091 2 11.7036 2.84434 12.9206 4.30466L16 8Z"
        fill={color}
      />
    </Svg>
  );
};


// export const EmployeeIconTest = ({ width, height, color, strokeWidth, opacity }: IconProps) => {
//   return (
//     <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" "><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><Circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></Svg>
//   );
// };
export const IMAGES = {
  Logo_tranfashion: require('./logo.png'),
  Product: require('./product.png'),
  Profil: require('./profil.png'),
  transaction: require('./transaction.png'),
};
